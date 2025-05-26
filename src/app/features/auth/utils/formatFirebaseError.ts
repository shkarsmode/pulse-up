export const formatFirebaseError = (error: any): string | null => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email address is already in use by another account.";
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/operation-not-allowed":
      return "Operation not allowed. Please contact support.";
    case "auth/weak-password":
      return "The password is too weak. Please choose a stronger one.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "User not found. Please check the email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/invalid-phone-number":
      return "The phone number is invalid. Please enter a valid phone number.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid. Please check the code and try again.";
    case "auth/credential-already-in-use":
      return "Something went wrong. If this credentials are used in another account, please delete that account before updating. In another case, please contact support.";
    case "auth/popup-closed-by-user":
      return "Popup closed by user.";
    case "auth/code-expired":
      return "The verification code has expired. Please request a new code.";
    case "auth/session-expired":
      return "Session expired. Please sign in again.";
    default:
      return null;
  }
};