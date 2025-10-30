import { useNavigate } from 'react-router-dom';
import Button from './reusable/Button';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FEF9] dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center">
                {/* 404 Number */}
                <h1 className="text-9xl font-extrabold text-darker-green dark:text-lighter-green mb-4">
                    404
                </h1>

                {/* Error Message */}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Page Not Found
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>

                {/* Decorative Icon */}
                <div className="mt-12">
                    <span className="material-symbols-outlined text-9xl text-darker-green/20 dark:text-lighter-green/20">
                        error
                    </span>
                </div>
            </div>
        </div>
    );
}
