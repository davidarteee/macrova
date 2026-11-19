import { Redirect } from 'expo-router';

// Phase 2 will redirect to the sign-in screen when there is no session.
export default function Index() {
  return <Redirect href="/today" />;
}
