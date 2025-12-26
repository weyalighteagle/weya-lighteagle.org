"use client"

import { useState, useEffect } from "react"
import { personas } from "@/lib/personas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Save,
    Lock,
    FileText,
    CheckCircle,
    AlertCircle,
    LogOut,
    LayoutDashboard,
    Database,
    ChevronRight,
    Loader2
} from "lucide-react"

export default function AdminKnowledgePage() {
    const [password, setPassword] = useState("")
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [selectedPersonaId, setSelectedPersonaId] = useState(personas[0]?.id || "")
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

    // Load content when persona changes
    useEffect(() => {
        if (isAuthenticated && selectedPersonaId) {
            fetchContent()
        }
    }, [selectedPersonaId, isAuthenticated])

    const fetchContent = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/knowledge?personaId=${selectedPersonaId}`, {
                headers: { "x-admin-password": password }
            })
            const data = await res.json()
            setContent(data.content || "")
        } catch (error) {
            console.error("Failed to load content", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setStatus(null)
        try {
            const res = await fetch("/api/admin/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personaId: selectedPersonaId,
                    content,
                    password,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to save")
            }

            setStatus({ type: "success", message: "Saved successfully" })
            setTimeout(() => setStatus(null), 3000)
        } catch (error: any) {
            setStatus({ type: "error", message: error.message || "Failed to save" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // Verify password by trying to fetch current persona
            const res = await fetch(`/api/admin/knowledge?personaId=${selectedPersonaId}`, {
                headers: { "x-admin-password": password }
            })

            if (res.ok) {
                setIsAuthenticated(true)
            } else {
                alert("Invalid Password")
            }
        } catch (e: any) {
            alert("Connection Error: " + (e.message || JSON.stringify(e)))
        } finally {
            setIsLoading(false)
        }
    }

    // LOGIN SCREEN
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                            <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900">Admin Authentication</h2>
                        <p className="text-sm text-zinc-500">Enter your access key to manage knowledge.</p>
                    </div>
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <Input
                            type="password"
                            autoFocus
                            required
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white"
                        />
                        <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                            Access Dashboard
                        </Button>
                    </form>
                </div>
            </div>
        )
    }

    // MAIN DASHBOARD
    return (
        <div className="flex h-screen w-full bg-zinc-50 text-zinc-900">
            {/* SIDEBAR */}
            <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white">
                <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
                    <Database className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold tracking-tight">Weya<span className="text-zinc-400">DB</span></span>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Knowledge Bases
                    </div>
                    <div className="space-y-1">
                        {personas.map((persona) => (
                            <button
                                key={persona.id}
                                onClick={() => { setSelectedPersonaId(persona.id); setStatus(null); }}
                                className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${selectedPersonaId === persona.id
                                    ? "bg-emerald-50 text-emerald-700 font-medium"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className={`h-4 w-4 ${selectedPersonaId === persona.id ? "text-emerald-500" : "text-zinc-400"}`} />
                                    <span>{persona.id}</span>
                                </div>
                                {selectedPersonaId === persona.id && <ChevronRight className="h-3 w-3 opacity-50" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-zinc-200 p-3">
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* TOOLBAR */}
                <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>/</span>
                        <span>knowledge</span>
                        <span>/</span>
                        <span className="font-medium text-zinc-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            {selectedPersonaId}.md
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {status && (
                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${status.type === "success"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700 border border-red-200"
                                }`}>
                                {status.type === "success" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                {status.message}
                            </div>
                        )}

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 min-w-[100px]"
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving</>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </header>

                {/* EDITOR AREA */}
                <div className="flex-1 overflow-hidden bg-zinc-50 p-6">
                    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="h-full w-full resize-none p-6 font-mono text-sm leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-300"
                                spellCheck={false}
                                placeholder="# Start writing markdown content..."
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
