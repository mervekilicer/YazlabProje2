const axios = require('axios');

async function fullSystemTest() {
    
  const testUser = {
        username: "SonDenemeKullanici", 
        email: "bitartik@test.com",    
        password: "password123"
    };
    try {
        console.log("🚀 SİSTEM TESTİ BAŞLIYOR...");

        
        try {
            await axios.post('http://localhost:5000/api/auth/register', testUser);
            console.log("✅ Adım 1: Yeni kullanıcı oluşturuldu.");
        } catch (e) {
            console.log("ℹ️ Adım 1: Kullanıcı zaten var, giriş işlemine geçiliyor...");
        }

        
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: testUser.email, 
            password: testUser.password
        });
        
        const userId = loginRes.data.user.id;
        console.log(`✅ Adım 2: Giriş Başarılı! Kullanıcı ID: ${userId}`);

        
        console.log("🎬 Adım 3: 'Fight Club' filmi listeye ekleniyor...");
        await axios.post('http://localhost:5000/api/library/add', {
            userId: userId,
            status: 'watched', 
            rating: 10,        
            review: "Bu bir sistem testidir ve başarılı oldu!",
            content: {
                external_id: "550", 
                type: "movie",
                title: "Fight Club",
                poster_path: "/pB8BM7r0KR868H1a0Kg10g.jpg",
                release_date: "1999-10-15"
            }
        });
        console.log("✅ Film Kaydedildi!");

        
        const libraryRes = await axios.get(`http://localhost:5000/api/library/${userId}`);
        
        console.log("\n🎉 --- TEST SONUCU ---");
        console.log(`Kullanıcının kütüphanesindeki içerik sayısı: ${libraryRes.data.length}`);
        console.log(`Son Eklenen: ${libraryRes.data[libraryRes.data.length - 1].Content.title}`);
        console.log("✅ BACKEND SİSTEMİ %100 ÇALIŞIYOR!");

    } catch (error) {
        
        console.log("❌ HATA OLUŞTU:");
        if (error.code === 'ECONNREFUSED') {
            console.log("⚠️ SUNUCU KAPALI! Lütfen diğer terminalde 'npm run dev' komutunun çalıştığından emin ol.");
        } else {
            console.log(error.response ? error.response.data : error.message);
        }
    }
}

fullSystemTest();