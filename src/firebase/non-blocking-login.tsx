
'use client';
import {
  Auth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in with a popup (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider).catch(error => {
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error('Google Sign-In Error:', error);
    } else {
      console.info('Google Sign-In popup closed by user.');
    }
  });
}


/**
 * Initiates phone number sign-in.
 * @param authInstance The Firebase Auth instance.
 * @param phoneNumber The user's phone number in E.164 format.
 * @param appVerifier The RecaptchaVerifier instance.
 * @returns A Promise that resolves with a ConfirmationResult object.
 */
export async function initiatePhoneNumberSignIn(
  authInstance: Auth,
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(authInstance, phoneNumber, appVerifier);
}

/**
 * Confirms the OTP code sent to the user's phone. This is now a blocking call.
 * @param confirmationResult The ConfirmationResult object from initiatePhoneNumberSignIn.
 * @param otpCode The 6-digit OTP code entered by the user.
 * @returns A Promise that resolves with the UserCredential on successful sign-in.
 */
export async function confirmOtpCode(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<UserCredential> {
  // CRITICAL: This must be awaited to verify the code before proceeding.
  return await confirmationResult.confirm(otpCode);
}
