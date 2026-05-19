import React from 'react';
import { JV, C } from '../theme/brand';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

export default function RadarCafe({ cafe }) {
  const datos = [
    { atributo: 'Acidez',  valor: cafe.acidez  || 0 },
    { atributo: 'Cuerpo',  valor: cafe.cuerpo  || 0 },
    { atributo: 'Dulzor',  valor: cafe.dulzor  || 0 },
    { atributo: 'Amargor', valor: cafe.amargor || 0 },
    { atributo: 'Intensidad', valor: cafe.intensidad || 0 },
  ];

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={datos} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(212,175,55,0.2)" />
          <PolarAngleAxis
            dataKey="atributo"
            tick={{ fill: 'rgba(245,234,216,0.7)', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'rgba(245,234,216,0.3)', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name={cafe.nombre}
            dataKey="valor"
            stroke={JV.gold}
            fill={JV.gold}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.cream,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13
            }}
            formatter={(value) => [`${value}/10`, 'Valor']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}