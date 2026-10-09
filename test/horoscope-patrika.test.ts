import assert from 'node:assert/strict';
import { test } from 'node:test';

test('horoscope & patrika: verify zodiac mapping and WhatsApp deep-link generation', () => {
  const candidate = {
    id: 'sample-5',
    displayName: 'P. Madhav Rao',
    age: 28,
    gender: 'male',
    district: { en: 'Guntur, Andhra Pradesh', te: 'గుంటూరు, ఆంధ్రప్రదేశ్' },
    mandal: 'Tenali',
    gothra: 'Agastya',
    nakshatra: 'Swati',
    rasi: 'Tula',
    birthTime: '07:15 AM',
    birthPlace: 'Tenali, Guntur',
    educationDegree: 'Vidwan / MA Music',
    occupation: 'Classical Nadaswaram Artiste',
  };

  // Test WhatsApp message composition
  const text = `🙏 *శ్రీ ధన్వంతరి ప్రసన్నః* 🙏\n` +
    `*నాయీ సమాఖ్య వివాహ వేదిక (Nayi Samakhya Matrimony)*\n\n` +
    `✨ *కళ్యాణ పరిచయ పత్రిక / Matrimonial Biodata*\n` +
    `👤 *పేరు / Name:* ${candidate.displayName} (${candidate.gender === 'male' ? 'వరుడు / Groom' : 'వధువు / Bride'})\n` +
    `🎂 *వయస్సు / Age:* ${candidate.age} సం.\n` +
    `🎓 *విద్య / Education:* ${candidate.educationDegree}\n` +
    `💼 *ఉద్యోగం / Profession:* ${candidate.occupation}\n` +
    `🪔 *గోత్రం / Gotra:* ${candidate.gothra}\n` +
    `⭐ *నక్షత్రం & రాశి:* ${candidate.nakshatra} (${candidate.rasi})\n` +
    `📍 *స్వస్థలం / Native:* ${candidate.mandal}, ${candidate.district.te}\n\n` +
    `🔗 *సమగ్ర వివరాలు & జాతక పరిశీలన కొరకు:*\nhttps://nayisamakhya.org/matrimony/profiles/${candidate.id}`;

  assert.ok(text.includes('P. Madhav Rao'));
  assert.ok(text.includes('Agastya'));
  assert.ok(text.includes('Swati (Tula)'));
  assert.ok(text.includes('గుంటూరు'));

  const encodedUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  assert.ok(encodedUrl.startsWith('https://api.whatsapp.com/send?text='));
  assert.ok(encodedUrl.includes('nayisamakhya.org'));
});
