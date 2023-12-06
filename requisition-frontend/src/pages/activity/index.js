import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/lib/axios";
import { Card } from "flowbite-react";
import DataTable from "react-data-table-component";
import { setActivity } from "@/store/slice/activitySlice";
import moment from "moment";

const Activity = () => {
    const dispatch = useDispatch();
    const activity = useSelector(state => state.activity);
    const [initialColumns, setInitialColumns] = useState([]);

    function data(){
        axios.get('/api/activity')
            .then(({data}) => {
                dispatch(setActivity(data?.data))
            })
            .catch(e => console.log(e))
    }

    useEffect(() => {
        data();
    }, [])

    useEffect(() => {
        if (activity && activity?.activity){
            setInitialColumns([
                {
                    name: 'User',
                    selector: row => row.causer?.name,
                    sortable: true,
                },
                {
                    name: 'Model',
                    selector: row => row.subject_type,
                    sortable: true,
                },
                {
                    name: 'Model ID',
                    selector: row => row.subject_id,
                    sortable: true,
                },
                {
                    name: 'Event',
                    selector: row => row.event,
                    sortable: true,
                },
                {
                    name: 'Description',
                    selector: row => row.description,
                    sortable: true,
                },
                {
                    name: 'Old',
                    selector: row => <pre>{JSON.stringify(row.properties?.old, null, 2)}</pre>,
                    sortable: true,
                },
                {
                    name: 'New',
                    selector: row =><pre>{JSON.stringify(row.properties?.new, null, 2)}</pre>,
                    sortable: true,
                },
                {
                    name: 'Created at',
                    selector: row => moment(row.created_at).format('hh:mm DD-MMM-Y'),
                    sortable: true,
                },
            ])
        }
    }, [activity]);

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Activity
                </h2>
            }>
            <Head>
                <title>{process.env.APP_NAME} - Activity</title>
            </Head>

            <div className="py-8">
                <div className="max-w-screen mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {
                                activity?.activity && (
                                    <Card>
                                        <h2>Latest Activity</h2>
                                        <DataTable
                                            columns={initialColumns}
                                            data={activity?.activity}
                                            pagination
                                            responsive
                                        />
                                    </Card>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default Activity;
