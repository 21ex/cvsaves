/* src/components/Footer.tsx – 2025-08-08
   Minimal site footer:
   - Left: "CVSaves" and "by CVSolutions" (replace with logos later)
   - Right (stacked): Terms & Conditions, Privacy Policy, Support Me
*/

import React from "react";

const SiteFooter: React.FC = () => {
    return (
        <footer className="border-t">
            <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Brand block — replace these with <img> logos later */}
                <div className="space-y-1">
                    <div className="text-xl font-semibold tracking-tight">CVSaves</div>
                    <div className="text-sm text-muted-foreground">
                        by <span className="font-medium">CVSolutions</span>
                    </div>
                    <div className="text-xs text-muted-foreground">CVSolutions</div>
                </div>

                {/* Right-side links */}
                <nav className="text-sm sm:text-right">
                    <ul className="space-y-2">
                        <li>
                            <a className="hover:underline" href="/terms" target="_blank" rel="noreferrer">
                                Terms &amp; Conditions
                            </a>
                        </li>
                        <li>
                            <a className="hover:underline" href="/privacy" target="_blank" rel="noreferrer">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a className="hover:underline" href="/support" target="_blank" rel="noreferrer">
                                Support Me
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
};

export default SiteFooter;
