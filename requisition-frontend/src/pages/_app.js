import 'tailwindcss/tailwind.css'
import { perStore, wrapper } from "@/store";
import { Provider } from "react-redux";
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import '../../styles/globals.css';
import Loading from "@/components/Loading";

const App = ({ Component, ...rest }) => {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;

    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={perStore}>
                <Component {...pageProps} />
            </PersistGate>
        </Provider>
    )
}

export default App;
