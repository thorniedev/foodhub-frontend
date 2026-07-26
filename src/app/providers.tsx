<<<<<<< HEAD
'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';

export function Providers({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
=======
// 'use client';

// import { ReactNode } from 'react';
// import { Provider } from 'react-redux';
// import { store } from '@/app/store/Providers';

// export function Providers({ children }: { children: ReactNode }) {
//   return <Provider store={store}>{children}</Provider>;
// }
>>>>>>> d1cdd83bd745a3a0f98e4be08cf8aa4555ae8915
