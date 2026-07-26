import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, setSessionCookie } from '../../../lib/auth';
import { sql } from '@/app/lib/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [user] = await sql`SELECT id, email, name, password_hash, avatar_url FROM users WHERE email = ${email}`;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('SIGNIN ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}