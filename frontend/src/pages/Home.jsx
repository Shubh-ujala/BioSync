import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Zap, CheckCircle, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center overflow-x-hidden">

            {/* Hero Section */}
            <section className="w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        <span className="text-text-muted">System Operational</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        Healthcare Monitor <br />
                        <span className="text-primary">
                            Reimagined
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
                        BioPulse connects patients and doctors through a seamless, real-time interface.
                        Monitor vitals, receive instant alerts, and track health history securely.
                    </p>

                    <Link
                        to="/login"
                        className="btn-primary text-lg px-8 py-4 h-auto rounded-full hover:scale-105 transition-all duration-300"
                    >
                        Launch Portal <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="w-full py-24 px-6 md:px-20 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Advanced Capabilities</h2>
                        <p className="text-text-muted">Everything you need for comprehensive health tracking.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Activity className="text-primary w-8 h-8" />}
                            title="Real-Time Streaming"
                            desc="Low-latency WebSocket connections ensure vitals are updated instantly across all dashboards."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Shield className="text-secondary w-8 h-8" />}
                            title="Enterprise Security"
                            desc="End-to-end encryption for all patient data, fully compliant with modern healthcare standards."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Zap className="text-accent w-8 h-8" />}
                            title="Instant Alerting"
                            desc="Automated critical value detection triggers immediate emergency alerts to connected admins."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="w-full py-24 px-6 md:px-20 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Seamless Integration</h2>
                        <p className="text-text-muted max-w-xl">
                            Our platform bridges the gap between patient devices and medical oversight in three simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        <StepCard
                            number="01"
                            title="Connect Device"
                            desc="Patients log in and connect their monitoring hardware. Data sync begins automatically."
                        />
                        <StepCard
                            number="02"
                            title="Live Transmission"
                            desc="Biomedical data is streamed securely to the BioPulse cloud via high-speed sockets."
                        />
                        <StepCard
                            number="03"
                            title="Doctor Review"
                            desc="Medical professionals view live feeds and receive alerts on their dedicated dashboard."
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full py-20 px-6 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-16 md:gap-32 text-center">
                    <StatItem value="10k+" label="Active Patients" />
                    <StatItem value="99.9%" label="Uptime" />
                    <StatItem value="<50ms" label="Latency" />
                    <StatItem value="24/7" label="Monitoring" />
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-12 px-6 text-center text-text-muted text-sm relative z-10">
                <div className="flex justify-center items-center gap-6 mb-8">
                    <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                        <Globe className="w-5 h-5" />
                    </a>
                    <a href="mailto:support@biopulse.com" className="opacity-50 hover:opacity-100 transition-opacity">
                        <Users className="w-5 h-5" />
                    </a>
                </div>
                <p>&copy; {new Date().getFullYear()} BioPulse Healthcare Systems. All rights reserved.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="glass p-10 flex flex-col items-start hover:border-primary/50 transition-colors group"
    >
        <div className="bg-white/5 p-4 rounded-xl mb-6 group-hover:bg-primary/20 transition-colors">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-text-muted leading-relaxed">{desc}</p>
    </motion.div>
);

const StepCard = ({ number, title, desc }) => (
    <div className="relative pl-8 border-l border-white/10 md:border-l-0 md:pl-0">
        <div className="text-6xl font-bold text-white/5 md:mb-4">{number}</div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-text-muted">{desc}</p>
    </div>
);

const StatItem = ({ value, label }) => (
    <div>
        <div className="text-4xl md:text-5xl font-bold mb-2 text-white">{value}</div>
        <div className="text-text-muted uppercase tracking-wider text-sm">{label}</div>
    </div>
);

export default Home;
