/**
 * CertificateView — uygulama içi sertifika görünümü (sade, gerçek belge gibi).
 * Fildişi zemin + çift altın çerçeve + lacivert serif başlık + el yazısı ad;
 * altında kısa künye, tarih, iki imza alanı ve mühür. Emoji ve süsleme yok.
 * A4 yatay oranı (1000×707 tasarım birimi) kapsayıcı genişliğine ölçeklenir:
 * masaüstünde büyük ve okunur, telefonda yatay oran korunur.
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { AppConfig, Certificate } from '@/domain/models';
import { certificateAccessibilityLabel, certificateCopy } from '@/lib/certificate-copy';
import { certificate, layout, shadows } from '@/theme';

const DESIGN_W = 1000;
const DESIGN_H = 707;

interface CertificateViewProps {
  certificate: Certificate;
  config: AppConfig;
}

export function CertificateView({ certificate: doc, config }: CertificateViewProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [measured, setMeasured] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setMeasured(event.nativeEvent.layout.width);

  const copy = certificateCopy(doc, config);
  // Kapsayıcı genişliği: ölçüm gelene kadar pencere ölçüsünden hesaplanır.
  // (Web'de onLayout gecikebildiği için belge ilk karede de doğru ölçekte çizilir.)
  const fallback = Math.max(
    0,
    Math.min(windowWidth, layout.maxWideWidth) - layout.screenPadding * 2,
  );
  const width = measured > 0 ? measured : fallback;
  const s = width > 0 ? width / DESIGN_W : 0;
  const px = (value: number) => value * s;
  // Uzun adlar tek satıra sığmalı: küçülerek taşmayı önler.
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
            borderColor: certificate.gold,
            borderRadius: px(8),
            padding: px(9),
          }}
        >
          <View
            style={{
              flex: 1,
              borderWidth: px(1.6),
              borderColor: certificate.goldDeep,
              borderRadius: px(4),
              paddingHorizontal: px(64),
              paddingTop: px(44),
              paddingBottom: px(26),
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: px(17),
                lineHeight: px(23),
                letterSpacing: px(4.5),
                textTransform: 'uppercase',
                color: certificate.ink,
                textAlign: 'center',
              }}
            >
              {copy.university}
            </Text>

            <Text
              style={{
                fontFamily: 'PlayfairDisplay_700Bold',
                fontSize: px(56),
                lineHeight: px(66),
                letterSpacing: px(4),
                textTransform: 'uppercase',
                color: certificate.ink,
                textAlign: 'center',
                marginTop: px(30),
              }}
            >
              {copy.title}
            </Text>

            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: px(18),
                lineHeight: px(24),
                letterSpacing: px(5),
                textTransform: 'uppercase',
                color: certificate.goldDeep,
                marginTop: px(34),
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
                maxWidth: px(840),
              }}
              numberOfLines={1}
            >
              {copy.name}
            </Text>

            <View
              style={{
                width: px(380),
                height: px(1.6),
                backgroundColor: certificate.gold,
                marginTop: px(10),
              }}
            />

            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: px(24),
                lineHeight: px(32),
                color: certificate.ink,
                textAlign: 'center',
                marginTop: px(16),
              }}
            >
              {copy.achievementLine}
            </Text>

            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: px(19),
                lineHeight: px(26),
                color: certificate.inkSoft,
                textAlign: 'center',
                marginTop: px(6),
              }}
            >
              {copy.detailLine}
            </Text>

            <View style={{ flex: 1 }} />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                alignSelf: 'stretch',
              }}
            >
              <SignatureBlock px={px} role={copy.leftRole} caption={copy.signatureCaption} />
              <Seal px={px} text={copy.sealText} />
              <SignatureBlock px={px} role={copy.rightRole} caption={copy.signatureCaption} />
            </View>

            <Text
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: px(16),
                lineHeight: px(22),
                letterSpacing: px(1.5),
                color: certificate.inkSoft,
                marginTop: px(14),
              }}
            >
              Belge No: {copy.numberLabel}
            </Text>
          </View>
        </LinearGradient>
      ) : null}
    </View>
  );
}

interface Scaled {
  px: (value: number) => number;
}

function SignatureBlock({ px, role, caption }: Scaled & { role: string; caption: string }) {
  return (
    <View style={{ width: px(230), alignItems: 'center', gap: px(6) }}>
      <View style={{ width: px(200), height: px(1.2), backgroundColor: certificate.ink, opacity: 0.5 }} />
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
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: px(15),
          lineHeight: px(18),
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
