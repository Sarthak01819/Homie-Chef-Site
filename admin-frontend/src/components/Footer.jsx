const Footer = () => {
    return (
        <footer className="bg-linear-to-br from-[#4B0C37] via-[#119DA4] to-[#FDE789] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">HC</span>
                            </div>
                            Homie Chef
                        </h3>
                        <p className="text-sm text-white/80 leading-relaxed">
                            Streamlining restaurant management with powerful admin tools for orders, users, and analytics.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
                        <div className="space-y-2">
                            <a href="/" className="block text-sm text-white/80 hover:text-white transition-colors">Dashboard</a>
                            <a href="/orders" className="block text-sm text-white/80 hover:text-white transition-colors">Orders</a>
                            <a href="/users" className="block text-sm text-white/80 hover:text-white transition-colors">Users</a>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Support</h4>
                        <div className="space-y-2 text-sm text-white/80">
                            <p>Need help? Contact our support team</p>
                            <p className="font-medium">support@homiechef.com</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-white/70">
                        © {new Date().getFullYear()} Homie Chef. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">v2.1.0</span>
                        <span className="text-xs text-white/60">Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;