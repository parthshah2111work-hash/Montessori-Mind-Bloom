import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Pillar, PILLAR_LABELS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Props {
  pillar: Pillar;
  small?: boolean;
}

export function PillarBadge({ pillar, small }: Props) {
  const colors = useColors();

  const colorMap: Record<Pillar, string> = {
    cognitive: colors.cognitive,
    language: colors.language,
    physical: colors.physical,
    socialEmotional: colors.socialEmotional,
    creative: colors.creative,
  };

  const bg = colorMap[pillar] + "26";
  const fg = colorMap[pillar];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.label, { color: fg }, small && styles.smallLabel]}>
        {PILLAR_LABELS[pillar]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  smallLabel: {
    fontSize: 10,
  },
});
