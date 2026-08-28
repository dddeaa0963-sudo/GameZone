import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { sendTelegramMessage } from '../server';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    let { name, email, password, role, status, balance, phone, country, login_id, pin } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    if (!login_id) {
        const usersWithLoginId = await User.find({ login_id: { $exists: true, $ne: null } });
        let maxLoginId = 99;
        usersWithLoginId.forEach(u => {
            const num = parseInt(u.login_id as string, 10);
            if (!isNaN(num) && num > maxLoginId) {
                maxLoginId = num;
            }
        });
        login_id = Math.max(100, maxLoginId + 1).toString();
    }

    const user = new User({ name, email, password, role, status, balance, phone, country, login_id, pin });
    await user.save();
    
    sendTelegramMessage(`👤 <b>مستخدم جديد مسجل!</b>\n\n<b>البريد:</b> ${email}\n<b>الاسم:</b> ${name || "غير محدد"}\n<b>الهاتف:</b> ${phone || "غير محدد"}`).catch(() => {});
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, status, balance, phone, image, country, pin, password } = req.body;
    const user = await User.findById(req.params.id);
    
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (role !== undefined) user.role = role;
      if (status !== undefined) user.status = status;
      if (balance !== undefined) user.balance = balance;
      if (phone !== undefined) user.phone = phone;
      if (image !== undefined) user.image = image;
      if (country !== undefined) user.country = country;
      if (pin !== undefined) user.pin = pin;
      if (password !== undefined) user.password = password;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && ((await bcrypt.compare(password, user.password || '')) || password === user.password)) {
      if (user.status === 'Suspended' || user.status === 'suspended') {
        return res.status(403).json({ message: 'Account is suspended' });
      }
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "غير معروف";
      const userAgent = req.headers["user-agent"] || "غير معروف";
      sendTelegramMessage(`🔐 <b>تسجيل دخول جديد!</b>\n\n<b>البريد:</b> ${user.email}\n<b>الاسم:</b> ${user.name || "غير محدد"}\n<b>الـ IP:</b> ${ip}\n<b>الجهاز:</b> ${userAgent}`).catch(() => {});
      res.json({
        _id: user._id,
        id: user._id,
        login_id: user.login_id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        balance: user.balance,
        phone: user.phone,
        image: user.image,
        country: user.country,
        pin: user.pin,
        password: user.password
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncUsers = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users)) return res.status(400).json({ message: 'Invalid data' });
    let synced = 0;
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const newUser = new User({
          name: u.name || 'مستخدم',
          email: u.email,
          password: u.password || '123456',
          role: u.isAdmin ? 'Admin' : 'User',
          status: 'Active',
          balance: u.balance || 0,
          phone: u.phone,
          image: u.image,
          country: u.country,
          login_id: u.login_id || u.id,
          pin: u.pin
        });
        await newUser.save();
        synced++;
      } else {
        let updated = false;
        if (u.pin && !exists.pin) { exists.pin = u.pin; updated = true; }
        if (u.password && (!exists.password || exists.password.startsWith('$2a$'))) { exists.password = u.password; updated = true; }
        if (updated) await exists.save();
      }
    }
    res.json({ message: `Synced ${synced} users successfully` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
