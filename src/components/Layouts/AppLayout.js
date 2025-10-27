import Navigation from "@/components/Layouts/Navigation";
import { useAuth } from "@/hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrganizationBranch from "@/components/Layouts/OrganizationBranch";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import { EchoConfig } from "@/lib/echo";
import { useDispatch, useSelector } from "react-redux";
import {
    setSingleInitialRequisition,
    updateSingleInitialRequisition,
} from "@/store/slice/dashboardSlice";
import { setSingleActivity } from "@/store/slice/activitySlice";
import {
    addNewOnline,
    removeOnline,
    setAllOnline,
} from "@/store/slice/userOnlineSlice";
import { Badge, ListGroup, Tooltip } from "flowbite-react";
import { DashboardAPI } from "@/store/service/dashboard";
import { useSubscribePushNotificationMutation } from "@/store/service/navigation";
import { GeneralBaseAPI } from "@/store/generalBaseAPI";

const AppLayout = ({ header, children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useAuth({ middleware: "auth" });
    const online_users = useSelector((state) => state.active_users);
    const [
        subscribePush,
        { data, isLoading },
    ] = useSubscribePushNotificationMutation();
    const [load, setLoad] = useState(false);
    const [echoInitialized, setEchoInitialized] = useState(false);

    const changingEffect = (effect) => {
        if (effect) {
            router.reload();
        }
    };
    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            setLoad(true);
        };

        router.events.on("routeChangeStart", handleRouteChange);
        router.events.on("routeChangeComplete", () => {
            setLoad(false);
        });

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off("routeChangeStart", handleRouteChange);
            router.events.off("routeChangeComplete", () => {
                setLoad(false);
            });
        };
    }, [router]);

    // Initialize Echo and set up listeners (once only)
    useEffect(() => {
        if (echoInitialized || !user) return;

        try {
            EchoConfig();
            setEchoInitialized(true);

            // Listen to initial requisition events
            window.Echo.private("initial_requisition").listen(
                "InitialRequisitionEvent",
                (e) => {
                    toast.success(
                        `A new requisition is initialised by ${e.requisition?.user?.name}`
                    );
                    dispatch(setSingleInitialRequisition(e.requisition));
                    dispatch(
                        DashboardAPI.util.invalidateTags([
                            "general_requisition",
                            "cash_requisition",
                        ])
                    );
                }
            );

            // Listen to activity events
            window.Echo.private("activity").listen("ActivityEvent", (event) => {
                dispatch(setSingleActivity(event.activity));
            });

            // Listen to query monitoring events
            window.Echo.private("query_monitoring").listen(
                "QueryMonitorEvent",
                (event) => {
                    console.log("Query Monitor:", event);
                }
            );

            // Join online presence channel
            window.Echo.join("online")
                .here((users) => {
                    console.log("Users currently online:", users);
                    dispatch(setAllOnline(users));
                })
                .joining((joiningUser) => {
                    console.log("User joined:", joiningUser);
                    dispatch(addNewOnline(joiningUser));
                })
                .leaving((leavingUser) => {
                    console.log("User left:", leavingUser);
                    dispatch(removeOnline(leavingUser));
                })
                .error((error) => {
                    console.error("Presence channel error:", error);
                });
        } catch (error) {
            console.error("Echo initialization failed:", error);
        }

        // Cleanup function
        return () => {
            if (window.Echo) {
                try {
                    window.Echo.leave("online");
                    window.Echo.private("initial_requisition").stopListening(
                        "InitialRequisitionEvent"
                    );
                    window.Echo.private("activity").stopListening(
                        "ActivityEvent"
                    );
                    window.Echo.private("query_monitoring").stopListening(
                        "QueryMonitorEvent"
                    );
                } catch (error) {
                    console.error("Echo cleanup error:", error);
                }
            }
        };
    }, [user, echoInitialized, dispatch]);

    // Listen to user-specific requisition status updates
    useEffect(() => {
        if (!user?.id || !window.Echo) return;

        const channelName = `requisition-status.${user.id}`;

        window.Echo.private(channelName).listen(
            "RequisitionStatusEvent",
            (event) => {
                console.log("Requisition status updated:", event);
                dispatch(updateSingleInitialRequisition(event.requisition));
                dispatch(
                    GeneralBaseAPI.util.invalidateTags([
                        "general_requisition",
                        "cash_requisition",
                        "edit-purchase-requisition",
                        "dashboard_cash_requisition",
                    ])
                );
                toast.success("Requisition Status Updated");
            }
        );

        // Cleanup
        return () => {
            if (window.Echo) {
                try {
                    window.Echo.private(channelName).stopListening(
                        "RequisitionStatusEvent"
                    );
                } catch (error) {
                    console.error(
                        "Failed to cleanup requisition status listener:",
                        error
                    );
                }
            }
        };
    }, [user?.id, dispatch]);

    // Register service worker and push notifications (once only)
    useEffect(() => {
        if (!user?.id || typeof window === "undefined") return;

        let isSubscribed = false;

        const registerServiceWorkerAndPush = async () => {
            try {
                // Check if Push API is supported
                if (!("PushManager" in window)) {
                    console.warn("Push notifications are not supported");
                    return;
                }

                // Check if Service Worker is supported
                if (!("serviceWorker" in navigator)) {
                    console.warn("Service workers are not supported");
                    return;
                }

                // Register service worker
                const registration = await navigator.serviceWorker.register(
                    "/serviceworker.js",
                    { scope: "/" }
                );
                console.log("Service worker registered:", registration);

                // Wait for service worker to be ready
                await navigator.serviceWorker.ready;

                // Check for existing subscription
                let subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    console.log("Existing push subscription found");
                    isSubscribed = true;
                    // Send existing subscription to server
                    subscribePush(subscription);
                    return;
                }

                // Subscribe to push notifications
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        "BLj_KK7o4C_emrLmBmVgIQmntpfWeC8TvR2MbP5pX2GIWeBclc8JQf091nn3jAfx2Xikx3HJ6bUP6OfUkPavWyI",
                });

                console.log("Push subscription created:", subscription);
                isSubscribed = true;

                // Send subscription to server
                subscribePush(subscription);
            } catch (error) {
                console.error("Push notification setup failed:", error);
            }
        };

        registerServiceWorkerAndPush();

        // Cleanup
        return () => {
            // No cleanup needed for service worker registration
            // as it persists across page loads
        };
    }, [user?.id, subscribePush]);

    return (
        <div
            className={`before:content-[''] before:bg-noise relative sm:before:w-[100%] before:h-full before:block before:absolute before:opacity-20 shadow-lg`}
        >
            <div
                className="min-h-screen min-w-fit relative"
                style={{ background: "rgb(67,129,216, .2)" }}
            >
                <Navigation user={user} />
                {/* Page Heading */}
                <header className="bg-white shadow-md flex flex-row before:content-[''] before:bg-noise relative before:w-full before:h-full before:block before:absolute before:opacity-5">
                    <div className="sm:max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                    <OrganizationBranch
                        changingEffect={changingEffect}
                        user={user}
                    />
                </header>

                {/* Page Content */}
                <main>
                    <Suspense fallback={<Loading />} children={children}>
                        {load ? <Loading /> : children}
                        <div className={`fixed bottom-2 right-5 h-fit w-fit`}>
                            <Tooltip
                                className={`flex w-full h-full justify-center items-center justify-items-center align-middle`}
                                content={
                                    <ListGroup>
                                        {online_users?.user_list ? (
                                            online_users?.user_list?.map(
                                                (user, index) => (
                                                    <ListGroup.Item key={index}>
                                                        {user.name}
                                                    </ListGroup.Item>
                                                )
                                            )
                                        ) : (
                                            <ListGroup.Item>
                                                No one is online currently.
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                }
                            >
                                <Badge
                                    className={`h-fit w-fit text-2xl font-bold rounded-full`}
                                >
                                    {online_users?.number_of_user ?? 0}
                                </Badge>
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
        </div>
    );
};

export default AppLayout;
