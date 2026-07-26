import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createToken, setSessionCookie } from '@/app/lib/auth';
import { sql } from '@/app/lib/db';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Select random profile picture from 1 to 7
    const randomPic = Math.floor(Math.random() * 7) + 1;

    // %20 represents the space in "pile_1 .webp"
    const avatar_url = `/pile_${randomPic}%20.webp`;

    // Insert user into database
    const [user] = await sql`
      INSERT INTO users (
        email,
        password_hash,
        name,
        avatar_url
      )
      VALUES (
        ${email},
        ${password_hash},
        ${name || null},
        ${avatar_url}
      )
      RETURNING id, email, name, avatar_url
    `;

    // Create authentication token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url
    });
    // console.log(user.name);
    
    // Set session cookie
    await setSessionCookie(token);

    // Return user data
    return NextResponse.json(
      { user },
      { status: 201 }
    );

  } catch (err) {
    console.error('Signup error:', err);

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}