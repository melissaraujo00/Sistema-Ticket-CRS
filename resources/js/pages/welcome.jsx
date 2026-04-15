import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/components/Welcome/Header';
import Hero from '@/components/Welcome/Hero';
import ContactSection from '@/components/Welcome/ContactSection';
import FaqSection from '@/components/Welcome/FaqSection';
import Footer from '@/components/Welcome/Footer';

export default function Welcome() {
    const { auth, knowledges } = usePage().props;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <Head title="Centro de Ayuda" />
            <Header auth={auth} />
            <Hero />
            <ContactSection />
            <FaqSection knowledges={knowledges} />
            <Footer />
        </div>
    );
}
