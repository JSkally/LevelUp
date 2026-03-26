import { useSignUp } from '@clerk/expo/legacy'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    if (!isLoaded) return
    try {
      const result = await signUp.create({ emailAddress: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(protected)')
      }
    } catch (err) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message ?? 'Sign up failed')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/sign-in')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#555', marginTop: 8 },
  error: { color: 'red', marginBottom: 12 },
})
