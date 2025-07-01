'use client';

import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function FirebaseConfigWarning() {
    const { isFirebaseConfigured } = useAuth();
    
    if (isFirebaseConfigured) {
        return null;
    }

    return (
        <div className="container my-4">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Action Required: Firebase Configuration Missing</AlertTitle>
                <AlertDescription>
                    It looks like your Firebase credentials are not set in the <code>.env</code> file. The app will not work correctly without them. Please find your project configuration in the Firebase console and add it to your <code>.env</code> file.
                </AlertDescription>
            </Alert>
        </div>
    );
}
