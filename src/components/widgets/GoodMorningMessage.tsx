import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button } from '@/components/ui'; // adjust import path if needed

// Array of sweet, pampering, romantic good‑morning messages
const messages: string[] = [
  'Selamat pagi, sayangku 🌞. Semoga harimu secerah senyummu yang menawan.',
  'Pagi cantik! Aku tidak sabar menunggu senyummu yang menyinari hariku.',
  'Bangun dan bersinar, babe! Aku mencintaimu lebih dari secangkir kopi pagi.',
  'Hai cinta, pagi ini terasa istimewa karena ada kamu di pikiranku.',
  'Selamat pagi, kekasih hatiku. Setiap detik bersamamu adalah anugerah.',
  'Pagi, manisku! Semoga harimu dipenuhi cinta, tawa, dan pelukan virtual dariku.',
  'Halo sayang, matahari mengirimkan sinarnya, tapi kau yang membuatku bersinar.',
  'Selamat pagi, bidadariku. Aku berharap harimu seindah hatimu.',
  'Pagi yang indah untuk orang paling manis di dunia – kamu! 💖',
  'Bangun, cantik! Hari baru, cinta baru, kebahagiaan baru bersama kamu.'
];

/**
 * GoodMorningMessage renders a random romantic greeting.
 * The message changes on each mount and can be refreshed via a button.
 */
export const GoodMorningMessage: React.FC = () => {
  const [msg, setMsg] = useState<string>('');

  const pickRandom = () => {
    const idx = Math.floor(Math.random() * messages.length);
    setMsg(messages[idx]);
  };

  useEffect(() => {
    pickRandom();
  }, []);

  return (
    <Card className="max-w-md mx-auto my-6">
      <CardHeader>
        <h2 className="text-xl font-bold text-center">Good Morning, Sayang!</h2>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg mb-4">{msg}</p>
        <Button onClick={pickRandom} className="bg-pink-500 hover:bg-pink-600 text-white">
          Dapatkan Pesan Lain
        </Button>
      </CardContent>
    </Card>
  );
};
