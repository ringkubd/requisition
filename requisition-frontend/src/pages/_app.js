import 'tailwindcss/tailwind.css'
import { perStore, wrapper } from "@/store";
import { Provider } from "react-redux";
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import '../../styles/globals.css';

const App = ({ Component, ...rest }) => {
    const {store, props} = wrapper.useWrappedStore(rest);
    const {pageProps} = props;

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={perStore}>
                <Component {...pageProps} />
            </PersistGate>
        </Provider>
    )
}

export default App;
