import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // --- ANIMATION SETUP ---
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);

  useEffect(() => {
    // 1. Breathing Effect (Main Circle)
    scale.value = withRepeat(
      withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite loop
      true // Reverse
    );

    // 2. Floating Effect (Small Satellite Circle)
    floatY.value = withRepeat(
      withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- VISUAL SECTION --- */}
        <View style={styles.visualContainer}>
          
          {/* Background Glow */}
          <View style={styles.glowBackground} />

          <View style={styles.circleWrapper}>
            
            {/* MAIN ANIMATED CIRCLE */}
            <Animated.View style={animatedBreathStyle}>
              <LinearGradient
                colors={['#2dd4bf', '#3b82f6']} // Teal to Blue
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCircle}
              >
                <View style={styles.innerWhiteCircle}>
                  <LinearGradient
                    colors={['#f0fdfa', '#e0f2fe']}
                    style={styles.innerGradient}
                  >
                    {/* Emoji: Seedling represents growth/recovery */}
                    <Text style={{ fontSize: 80 }}>🌱</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* SATELLITE ORANGE CIRCLE */}
            <Animated.View style={[animatedFloatStyle, styles.satelliteCircleWrapper]}>
                <LinearGradient
                    colors={['#fbbf24', '#f97316']} // Amber to Orange
                    style={styles.satelliteCircle}
                />
            </Animated.View>
          </View>
        </View>

        {/* --- TEXT & BUTTON SECTION --- */}
        <View style={styles.contentContainer}>
          
          {/* Title & Subtitle */}
          <View style={styles.textWrapper}>
            <Animated.Text 
              entering={FadeInDown.delay(300).duration(1000).springify()} 
              style={styles.title}
            >
              Relapse Tracker
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeInDown.delay(500).duration(1000).springify()}
              style={styles.subtitle}
            >
              Break free from habits that hold you back. Your journey to clarity and control starts today.
            </Animated.Text>
          </View>

          {/* Single Action Button */}
          <Animated.View entering={FadeInUp.delay(700).duration(1000).springify()}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/sign-in')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  glowBackground: {
    position: 'absolute',
    top: 80,
    height: 300,
    width: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(45, 212, 191, 0.2)', // Teal with low opacity
    opacity: 0.6,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#2dd4bf',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 30,
    elevation: 10,
  },
  innerWhiteCircle: {
    height: '98%',
    width: '98%',
    borderRadius: 1000,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  satelliteCircleWrapper: {
    position: 'absolute',
    right: -4,
    bottom: 0,
  },
  satelliteCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  contentContainer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 32,
  },
  textWrapper: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a', // Slate 900
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b', // Slate 500
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#0f172a', // Slate 900
    paddingVertical: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});