require('dotenv').config(); 
const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { LocalAuth, Client } = require('whatsapp-web.js');

const balasan = {
    "apa kabar?":"baik baik aja",
    "bagaimana dengan mu saat ini?":"masi sama seperti dulu sebelum kau tinggalkan aku",
    "dia kemana":"lagi bahagia sama yang lain",
    "kmau gpp kan?":"iy gpp kok tenang aja😊",
    "palakmu": "palamu to o",
    "p": "Iya ada apa?",
    "kamu lagi apa":"lagi gak ngapa ngapain sih kenapa?",
    "halo": "Halo juga! 👋 Ada yang bisa saya bantu?",
    "hai": "Hai! Apa kabar? 😊",
    "alhamadulillah baik": "alhamdulillah klw gitu",
    "assalamualaikum": "Waalaikumsalam warahmatullahi wabarakatuh 🙏",
    "siapa kamu": "Saya adalah bot buatan Har.. 🤖, di sini untuk membantumu.",
    "terima kasih": "Sama-sama! Semoga harimu menyenangkan 😊",
    "jam berapa sekarang": `Sekarang jam ${new Date().toLocaleTimeString('id-ID')}`,
    "tanggal berapa hari ini": `Hari ini adalah ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    "help": `Berikut daftar perintah yang bisa kamu coba:\n- halo\n- siapa kamu\n- p\n- kamu lagi  apa\n- jam berapa sekarang\n- tanggal berapa hari ini\n- kontak admin`,
    "kontak admin": "Hubungi admin di wa.me/6282192445687 📱"
};
const app = express();
const port = process.env.PORT || 300;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'har-bot' })
});

client.on('qr', qr => 
    qrcode.generate(qr, { small: true })
)
client.on('authenticated',() => console.log('qrcode di scan........'))

client.on('ready', () => {
    console.log('Bot siap digunakan!');
})
client.on('message', async message => {
    const pesan = (message.body.trim().toLowerCase())
    if (balasan[pesan]) {
        console.log('pesan dia : ', pesan)
        const user = message.body.substring(4)
        console.log(user)
        message.reply(balasan[pesan])
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: user }]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const reply = response.data.choices[0].message.content.trim();
            await message.reply(reply);

        } catch (error) {
            console.error('Gagal membalas dengan AI:', error.response?.data || error.message);
            await message.reply('Maaf, lagi gak moood :( cari yang lain aja dlu lagi berproses soalnya.');
        }
    }else{
        await message.reply('maaf saya tidak mengerti dengan pesan itu, coba ketik help, untuk melihat daftar perintah yang tersediah saat ini')
    }
})

client.initialize()

app.listen(port, () => console.log('Server bot berjalan di port: ' + port))
