const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');


exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Eksik bilgi.' });

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Bu e-posta zaten kullanımda.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'Kayıt başarılı!', user: newUser });
    } catch (error) { res.status(500).json({ error: 'Sunucu hatası.' }); }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Şifre hatalı.' });

        const token = jwt.sign({ id: user.id }, 'GIZLI_ANAHTAR', { expiresIn: '1h' });
        res.json({ message: 'Giriş başarılı!', token, user });
    } catch (error) { res.status(500).json({ error: 'Hata.' }); }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

       
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; 
        await user.save();

        
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;

        
        console.log("---------------------------------------------------");
        console.log("📧 [SİMÜLASYON] Şifre Sıfırlama Linki:");
        console.log(resetLink);
        console.log("---------------------------------------------------");

        res.json({ message: 'Sıfırlama bağlantısı gönderildi! (Backend terminaline bak)' });
    } catch (error) { res.status(500).json({ error: 'Hata.' }); }
};


exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        
        const user = await User.findOne({ 
            where: { 
                email: email, 
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() }
            } 
        });

        if (!user) return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş link.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        res.json({ message: 'Şifreniz başarıyla değiştirildi.' });
    } catch (error) { res.status(500).json({ error: 'Hata.' }); }
};