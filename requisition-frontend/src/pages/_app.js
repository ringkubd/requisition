import 'tailwindcss/tailwind.css'
import { perStore, wrapper } from "@/store";
import { Provider } from "react-redux";
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import '../../styles/globals.css';
import Loading from "@/components/loading";
import { Iceland } from 'next/font/google'
const roboto = Iceland({
    weight: ['400'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
})
const App = ({ Component, ...rest }) => {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;

    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={perStore}>
                <main className={roboto}>
                    <Component {...pageProps} />
                </main>
            </PersistGate>
        </Provider>
    )
}

export default App;
