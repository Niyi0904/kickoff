import { Suspense } from 'react';
import CallbackContent from './callback-content';

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
