import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ActiveOrdersPage from './pages/ActiveOrdersPage';
import HomePage from './pages/HomePage';
import NewOrderPage from './pages/NewOrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrdersPage from './pages/OrdersPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/orders',
        element: <OrdersPage />,
    },
    {
        path: '/orders/new',
        element: <NewOrderPage />,
    },
    {
        path: '/orders/active',
        element: <ActiveOrdersPage />,
    },
    {
        path: '/orders/history',
        element: <OrderHistoryPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>,
);
