import { useUser, useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { View, Text, Pressable, StyleSheet } from 'react-native'

export default function HomeScreen() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()
  const role = (user?.publicMetadata?.role as string) ?? 'athlete'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/sign-in')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to LevelUP</Text>
      <Text style={styles.info}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
      <Text style={styles.info}>Role: {role}</Text>
      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  info: { fontSize: 16, color: '#555', marginBottom: 8 },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
})
