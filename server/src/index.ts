import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const JWT_SECRET = 'messenger_secret_key_change_in_production';
const PORT = process.env.PORT || 3001;

// PostgreSQL
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'postgres',
  port: 5432,
  user: process.env.POSTGRES_USER || 'messenger',
  password: process.env.POSTGRES_PASSWORD || 'messenger_pass',
  database: process.env.POSTGRES_DB || 'messenger',
});

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация БД
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(20) CHECK (type IN ('private', 'group', 'channel')) NOT NULL,
      title VARCHAR(100),
      avatar_url TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (chat_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      content_type VARCHAR(20) DEFAULT 'text',
      reply_to UUID REFERENCES messages(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at DESC);
  `);
  console.log('Database initialized');
}

// WebSocket connections
const clients = new Map();

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    clients.set(decoded.userId, ws);
    console.log(`User ${decoded.userId} connected`);

    ws.on('close', () => {
      clients.delete(decoded.userId);
      console.log(`User ${decoded.userId} disconnected`);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(decoded.userId, message, ws);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });
  } catch (e) {
    ws.close();
  }
});

function handleWebSocketMessage(userId: string, message: any, ws: any) {
  switch (message.type) {
    case 'message':
      handleNewMessage(userId, message);
      break;
    case 'typing':
      handleTyping(userId, message);
      break;
  }
}

async function handleNewMessage(senderId: string, message: any) {
  const { chatId, content, replyTo } = message;

  // Сохраняем в БД
  const result = await pool.query(
    `INSERT INTO messages (chat_id, sender_id, content, content_type, reply_to)
     VALUES ($1, $2, $3, 'text', $4)
     RETURNING *`,
    [chatId, senderId, content, replyTo || null]
  );

  const savedMessage = result.rows[0];

  // Отправляем всем участникам чата
  const membersResult = await pool.query(
    'SELECT user_id FROM chat_members WHERE chat_id = $1',
    [chatId]
  );

  for (const row of membersResult.rows) {
    const client = clients.get(row.user_id);
    if (client && client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'message',
        chatId,
        message: {
          ...savedMessage,
          senderId,
          contentType: 'text',
          status: row.user_id === senderId ? 'sent' : 'delivered',
        },
      }));
    }
  }
}

function handleTyping(senderId: string, message: any) {
  const { chatId, isTyping } = message;
  
  // Получаем участников чата и отправляем им индикацию
  pool.query(
    'SELECT user_id FROM chat_members WHERE chat_id = $1 AND user_id != $2',
    [chatId, senderId]
  ).then(result => {
    for (const row of result.rows) {
      const client = clients.get(row.user_id);
      if (client && client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'typing',
          chatId,
          userId: senderId,
          isTyping,
        }));
      }
    }
  });
}

// REST API Routes

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверяем занят ли username
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username или email уже заняты' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $1)
       RETURNING id, username, email, display_name, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Неверные credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Chats
app.get('/api/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const result = await pool.query(`
      SELECT c.*, 
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id) as members,
        (SELECT COUNT(*) FROM messages m 
         JOIN chat_members cm ON m.chat_id = cm.chat_id 
         WHERE cm.user_id = $1 AND m.chat_id = c.id AND m.sender_id != $1
         AND NOT EXISTS (SELECT 1 FROM messages m2 WHERE m2.chat_id = c.id AND m2.sender_id = $1 AND m2.created_at > m.created_at)
        ) as unread_count
      FROM chats c
      JOIN chat_members cm ON c.id = cm.chat_id
      WHERE cm.user_id = $1
      ORDER BY last_message_time DESC NULLS LAST
    `, [decoded.userId]);

    const chats = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      avatarUrl: row.avatar_url,
      lastMessage: row.last_message_content ? {
        content: row.last_message_content,
        timestamp: row.last_message_time,
      } : undefined,
      unreadCount: parseInt(row.unread_count) || 0,
      members: parseInt(row.members),
      createdAt: row.created_at,
    }));

    res.json(chats);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { type, title, members } = req.body;

    // For private chats, check if chat already exists
    if (type === 'private' && members && members.length > 0) {
      const existingChat = await pool.query(
        `SELECT c.id FROM chats c
         JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = $1
         JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = $2
         WHERE c.type = 'private'`,
        [decoded.userId, members[0]]
      );

      if (existingChat.rows.length > 0) {
        // Return existing chat
        const chatId = existingChat.rows[0].id;
        const chatData = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);
        const otherUser = await pool.query(
          'SELECT id, username, display_name, avatar_url FROM users WHERE id = $1',
          [members[0]]
        );
        
        return res.json({
          id: chatData.rows[0].id,
          type: chatData.rows[0].type,
          title: otherUser.rows[0].display_name,
          avatarUrl: otherUser.rows[0].avatar_url,
          unreadCount: 0,
          members: 2,
          createdAt: chatData.rows[0].created_at,
        });
      }
    }

    // Get other user's name for private chat
    let chatTitle = title;
    if (type === 'private' && members && members.length > 0) {
      const otherUser = await pool.query(
        'SELECT display_name FROM users WHERE id = $1',
        [members[0]]
      );
      chatTitle = otherUser.rows[0]?.display_name || 'Chat';
    }

    const chatResult = await pool.query(
      `INSERT INTO chats (type, title, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [type, chatTitle, decoded.userId]
    );

    const chat = chatResult.rows[0];

    // Добавляем создателя
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)',
      [chat.id, decoded.userId, 'admin']
    );

    // Добавляем участников
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        await pool.query(
          'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [chat.id, memberId, 'member']
        );
      }
    }

    res.json({
      id: chat.id,
      type: chat.type,
      title: chat.title,
      avatarUrl: chat.avatar_url,
      unreadCount: 0,
      members: members ? members.length + 1 : 1,
      createdAt: chat.created_at,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Messages
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Проверяем доступ к чату
    const memberCheck = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, decoded.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Нет доступа к чату' });
    }

    const result = await pool.query(`
      SELECT m.*, u.display_name as sender_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2
    `, [chatId, limit]);

    const messages = result.rows.map(row => ({
      id: row.id,
      chatId: row.chat_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      content: row.content,
      contentType: row.content_type,
      timestamp: row.created_at,
      status: row.sender_id === decoded.userId ? 'read' : 'delivered',
    })).reverse();

    res.json(messages);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { chatId } = req.params;
    const { content, contentType = 'text', replyTo } = req.body;

    const result = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, content, content_type, reply_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [chatId, decoded.userId, content, contentType, replyTo || null]
    );

    const message = result.rows[0];

    res.json({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      content: message.content,
      contentType: message.content_type,
      timestamp: message.created_at,
      status: 'sent',
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// User search
app.get('/api/users/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT id, username, display_name, avatar_url 
       FROM users 
       WHERE id != $1 AND (
         username ILIKE $2 OR display_name ILIKE $2
       )
       LIMIT 20`,
      [decoded.userId, `%${query}%`]
    );

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    }));

    res.json(users);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Start server
async function main() {
  try {
    await initDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

main();
