/**
 * CertificateView — uygulama içi sertifika önizlemesi.
 * Klasik belge dili (referans görsel): fildişi zemin, çift altın çerçeve, lacivert
 * serif başlık, el yazısı ad, köşede rozet, alt orta nokta balmumu mühür ve iki
 * imza bloğu. A4 yatay oranı (1000×707 tasarım birimi) gerçek en-boy oranında
 * çizilir; içerik ekran genişliğine göre ölçeklenir.
 *
 * Emoji KULLANILMAZ — süsleme geometri ve tipografiyle yapılır (harf-grafik
 * ★ ◆ yalnız tekil glif olarak, yan yana iki emoji olacak şekilde kullanılmaz).
 */

import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { AppConfig, Certificate, Medal } from '@/domain/models';
import { certificateAccessibilityLabel, certificateCopy } from '@/lib/certificate-copy';
import { certificate, shadows } from '@/theme';

const DESIGN_W = 1000;
const DESIGN_H = 707;

const MEDAL_TONE: Record<Medal, { main: string; deep: string }> = {
  gold: { main: '#C9A227', deep: '#8A6B10' },
  silver: { main: '#8D9CB8', deep: '#5F6E88' },
  bronze: { main: '#C07A45', deep: '#8A5327' },
};

interface CertificateViewProps {
  certificate: Certificate;
  config: AppConfig;
}

export function CertificateView({ certificate: doc, config }: CertificateViewProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const copy = certificateCopy(doc, config);
  const tone = MEDAL_TONE[doc.medal];
  const s = width > 0 ? width / DESIGN_W : 0;
  const px = (value: number) => value * s;
  // Uzun adlar tek satıra sığmalı: küçülerek taşmayı önler (PDF ile aynı eşik).
  const nameSize = copy.name.length > 26 ? 46 : copy.name.length > 18 ? 58 : 74;

  return (
    <View
      accessibilityLabel={certificateAccessibilityLabel(doc, config)}
      onLayout={onLayout}
      style={[styles.stage, width > 0 ? { height: DESIGN_H * s } : null]}
    >
      {width > 0 ? (
        <LinearGradient
          colors={[certificate.paper, certificate.paperEdge]}
          style={{
            width: DESIGN_W * s,
            height: DESIGN_H * s,
            borderWidth: px(6),
            borderColor: tone.main,
            borderRadius: px(8),
            padding: px(9),
          }}
        >
          <View
            style={{
              flex: 1,
              borderWidth: px(1.6),
              borderColor: tone.deep,
              borderRadius: px(4),
              paddingHorizontal: px(54),
              paddingTop: px(40),
              paddingBottom: px(30),
            }}
          >
            <Rosette px={px} toneMain={tone.main} toneDeep={tone.deep} />
            <NumberPlate px={px} toneMain={tone.main} label={copy.numberLabel} period={copy.periodLabel} />

            <View style={{ alignItems: 'center', gap: px(10), marginTop: px(2) }}>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: px(17),
                  lineHeight: px(23),
                  letterSpacing: px(4.5),
                  textTransform: 'uppercase',
                  color: certificate.ink,
                  textAlign: 'center',
                  maxWidth: px(620),
                }}
              >
                {copy.university}
              </Text>
              <Ornament px={px} toneMain={tone.main} />
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: px(21),
                  lineHeight: px(27),
                  fontStyle: 'italic',
                  color: certificate.inkSoft,
                  textAlign: 'center',
                }}
              >
                {copy.project}
              </Text>
            </View>

            <View style={{ alignItems: 'center', marginTop: px(24), gap: px(9) }}>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_700Bold',
                  fontSize: px(54),
                  lineHeight: px(64),
                  letterSpacing: px(4),
                  textTransform: 'uppercase',
                  color: certificate.ink,
                  textAlign: 'center',
                }}
              >
                {copy.title}
              </Text>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_700Bold',
                  fontSize: px(20),
                  lineHeight: px(26),
                  letterSpacing: px(5),
                  color: tone.deep,
                  textAlign: 'center',
                }}
              >
                {copy.medalLine}
              </Text>
            </View>

            <View style={{ alignItems: 'center', marginTop: px(26), gap: px(5) }}>
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: px(18),
                  lineHeight: px(24),
                  letterSpacing: px(5),
                  textTransform: 'uppercase',
                  color: certificate.goldDeep,
                }}
              >
                {copy.ownerLabel}
              </Text>
              <Text
                style={{
                  fontFamily: 'DancingScript_700Bold',
                  fontSize: px(nameSize),
                  lineHeight: px(nameSize * 1.16),
                  color: certificate.ink,
                  textAlign: 'center',
                  maxWidth: px(880),
                }}
                numberOfLines={1}
              >
                {copy.name}
              </Text>
              <View style={{ width: px(380), height: px(1.6), backgroundColor: tone.main, marginTop: px(3) }} />
              <Text
                style={{
                  fontFamily: 'PlayfairDisplay_400Regular',
                  fontSize: px(22),
                  lineHeight: px(32),
                  color: certificate.inkSoft,
                  textAlign: 'center',
                  marginTop: px(8),
                  maxWidth: px(860),
                }}
              >
                {copy.achievement}
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <SignatureBlock px={px} role={copy.leftRole} caption={copy.signatureCaption} />
              <Seal px={px} text={copy.sealText} />
              <SignatureBlock px={px} role={copy.rightRole} caption={copy.signatureCaption} />
            </View>
          </View>
        </LinearGradient>
      ) : null}
    </View>
  );
}

interface Scaled {
  px: (value: number) => number;
}

function Rosette({ px, toneMain, toneDeep }: Scaled & { toneMain: string; toneDeep: string }) {
  return (
    <View style={{ position: 'absolute', left: px(26), top: px(24), width: px(96), height: px(134), alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: px(52),
          left: px(19),
          width: px(24),
          height: px(74),
          backgroundColor: toneMain,
          transform: [{ rotate: '-13deg' }],
          borderBottomLeftRadius: px(3),
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: px(52),
          left: px(49),
          width: px(24),
          height: px(74),
          backgroundColor: toneDeep,
          transform: [{ rotate: '13deg' }],
          borderBottomRightRadius: px(3),
        }}
      />
      <View
        style={{
          width: px(80),
          height: px(80),
          borderRadius: px(40),
          backgroundColor: certificate.ink,
          borderWidth: px(5),
          borderColor: toneMain,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: px(62),
            height: px(62),
            borderRadius: px(31),
            borderWidth: px(1.2),
            borderColor: certificate.goldSoft,
            opacity: 0.75,
          }}
        />
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: px(32), lineHeight: px(36), color: toneMain }}>
          {'★'}
        </Text>
      </View>
    </View>
  );
}

function NumberPlate({
  px,
  toneMain,
  label,
  period,
}: Scaled & { toneMain: string; label: string; period: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        right: px(24),
        top: px(28),
        alignItems: 'center',
        gap: px(3),
        borderWidth: px(1.4),
        borderColor: toneMain,
        borderRadius: px(6),
        paddingHorizontal: px(14),
        paddingVertical: px(7),
      }}
    >
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: px(12),
          lineHeight: px(16),
          letterSpacing: px(2.5),
          textTransform: 'uppercase',
          color: certificate.goldDeep,
        }}
      >
        Belge No
      </Text>
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: px(17),
          lineHeight: px(22),
          letterSpacing: px(0.5),
          color: certificate.ink,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: px(12),
          lineHeight: px(16),
          color: certificate.inkSoft,
        }}
      >
        {period}
      </Text>
    </View>
  );
}

function Ornament({ px, toneMain }: Scaled & { toneMain: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(10) }}>
      <View style={{ width: px(92), height: px(1.2), backgroundColor: toneMain }} />
      <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: px(14), lineHeight: px(18), color: toneMain }}>
        {'◆'}
      </Text>
      <View style={{ width: px(92), height: px(1.2), backgroundColor: toneMain }} />
    </View>
  );
}

function SignatureBlock({
  px,
  role,
  caption,
}: Scaled & { role: string; caption: string }) {
  return (
    <View style={{ width: px(230), alignItems: 'center', gap: px(6) }}>
      <View style={{ width: px(200), height: px(1.2), backgroundColor: certificate.ink, opacity: 0.55 }} />
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: px(21),
          lineHeight: px(27),
          color: certificate.ink,
          textAlign: 'center',
        }}
      >
        {role}
      </Text>
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: px(15),
          lineHeight: px(20),
          letterSpacing: px(3),
          textTransform: 'uppercase',
          color: certificate.inkSoft,
        }}
      >
        {caption}
      </Text>
    </View>
  );
}

function Seal({ px, text }: Scaled & { text: string }) {
  return (
    <View
      style={{
        width: px(104),
        height: px(104),
        borderRadius: px(52),
        backgroundColor: certificate.seal,
        borderWidth: px(3),
        borderColor: certificate.sealDeep,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: px(4),
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: px(88),
          height: px(88),
          borderRadius: px(44),
          borderWidth: px(1.4),
          borderColor: 'rgba(255,236,214,0.6)',
        }}
      />
      <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: px(15), lineHeight: px(19), color: '#F7DFC8' }}>
        {'★'}
      </Text>
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: px(14),
          lineHeight: px(17),
          letterSpacing: px(1),
          color: '#FFF3E2',
          textAlign: 'center',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    ...shadows.card,
  },
});
