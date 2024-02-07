import Navigation from '@/components/Layouts/Navigation'
import { useAuth } from '@/hooks/auth'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import OrganizationBranch from "@/components/Layouts/OrganizationBranch";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import { EchoConfig } from "@/lib/echo";
import { useDispatch, useSelector } from "react-redux";
import { setSingleInitialRequisition, updateSingleInitialRequisition } from "@/store/slice/dashboardSlice";
import { setSingleActivity } from "@/store/slice/activitySlice";
import { addNewOnline, removeOnline, setAllOnline } from "@/store/slice/userOnlineSlice";
import { Badge, ListGroup, Tooltip } from "flowbite-react";
import { DashboardAPI } from "@/store/service/dashboard";
import { PurchaseRequisitionApi } from "@/store/service/requisitions/purchase";
import { useSubscribePushNotificationMutation } from "@/store/service/navigation";

const AppLayout = ({ header, children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useAuth({ middleware: 'auth' })
    const online_users = useSelector(state => state.active_users);
    const [subscribePush, {data, isLoading}] = useSubscribePushNotificationMutation();

    const changingEffect = (effect) => {
        if (effect){
            router.reload();
        }
    }
    const [load, setLoad] = useState(false);
    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            setLoad(true)
        }

        router.events.on('routeChangeStart', handleRouteChange)
        router.events.on('routeChangeComplete', () => {
            setLoad(false);
        })

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
            router.events.off('routeChangeComplete', () => {
                setLoad(false);
            })
        }
    }, [router])

    useEffect(() => {
        EchoConfig();
        window.Echo.private('initial_requisition')
            .listen('InitialRequisitionEvent', e => {
                toast.success(`A new requisition is initialised by ${e.requisition?.user?.name}`)
                dispatch(setSingleInitialRequisition(e.requisition))
                dispatch(DashboardAPI.util.invalidateTags(['general_requisition', 'cash_requisition']));
            })
        window.Echo.private('activity')
            .listen('ActivityEvent', event => {
                dispatch(setSingleActivity(event.activity))
            })
        window.Echo.private('query_monitoring')
            .listen('QueryMonitorEvent', event => {
                console.log(event)
            })
        window.Echo.join('online')
            .here((users) => {
                dispatch(setAllOnline(users))
            })
            .joining((user) => {
                dispatch(addNewOnline(user))
            })
            .leaving((user) => {
                dispatch(removeOnline(user))
            })
    }, [])

    useEffect(() => {
        if (user){
            window.Echo.private(`requisition-status.${user?.id}`)
                .listen('RequisitionStatusEvent', event => {
                    dispatch(updateSingleInitialRequisition(event.requisition));
                    dispatch(DashboardAPI.util.invalidateTags(['general_requisition', 'cash_requisition']));
                    dispatch(PurchaseRequisitionApi.util.invalidateTags(['edit-purchase-requisition']));
                    toast.success(`Requisition Status Updated`)
                })
        }
    }, [user]);

    useEffect(() => {
        if ('PushManager' in window) {
            navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
                serviceWorkerRegistration.pushManager
                    .getSubscription()
                    .then((subscription) => {
                        /*if (!subscription) {
                            console.log(subscription, 456)
                            return;
                        }*/
                    })
                    .catch((err) => {
                        console.error(`Error during getSubscription(): ${err}`);
                    });
            });
        }
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/serviceworker.js', { scope: '/' })
                .then((registration) => {
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: 'BLj_KK7o4C_emrLmBmVgIQmntpfWeC8TvR2MbP5pX2GIWeBclc8JQf091nn3jAfx2Xikx3HJ6bUP6OfUkPavWyI'
                    });
                })
                .then(function(subscription){
                    subscribePush(subscription)
                })
                .catch((error) => {
                    console.error('Service worker registration failed:', error);
                });
        }
    }, [window]);


    return (
        <div className="min-h-screen min-w-fit bg-gray-100 dark:bg-gray-100">
            <Navigation user={user} />
            {/* Page Heading */}
            <header className="bg-white shadow-md flex flex-row">
                <div className="sm:max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {header}
                </div>
                <OrganizationBranch changingEffect={changingEffect} user={user} />
            </header>

            {/* Page Content */}
            <main>
                <Suspense fallback={<Loading />} children={children}>
                    {load ? (
                        <Loading />
                    ) : children}
                    <div className={`fixed bottom-2 right-5 h-fit w-fit`}>
                        <Tooltip className={`flex w-full h-full justify-center items-center justify-items-center align-middle`} content={
                            <ListGroup>
                                {
                                    online_users?.user_list ? online_users?.user_list?.map((user, index) => (
                                        <ListGroup.Item key={index}>{user.name}</ListGroup.Item>
                                    )) : <ListGroup.Item>No one is online currently.</ListGroup.Item>
                                }
                            </ListGroup>
                        }>
                            <Badge className={`h-fit w-fit text-2xl font-bold rounded-full`}>{online_users?.number_of_user ?? 0}</Badge>
                        </Tooltip>
                    </div>
                </Suspense>
            </main>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default AppLayout
