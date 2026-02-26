module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { personaId, sessionId, userMessage, messages } = body;
        // Determine the actual message to send (userMessage or last from messages)
        const messageToSend = userMessage || (messages && messages.length > 0 ? messages[messages.length - 1].content : "");
        if (!messageToSend) {
            return Response.json({
                error: "Missing userMessage or messages"
            }, {
                status: 400
            });
        }
        // Default to impact_startups if personaId is missing or invalid
        let targetPersonaId = personaId || "impact_startups";
        // Safety check: ensure personaId doesn't contain path traversal
        if (targetPersonaId.includes("..") || targetPersonaId.includes("/") || targetPersonaId.includes("\\")) {
            targetPersonaId = "impact_startups";
        }
        let knowledgeContext = "";
        try {
            const knowledgePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data", "knowledge", `${targetPersonaId}.md`);
            knowledgeContext = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(knowledgePath, "utf-8");
        } catch (err) {
            console.warn(`Could not load knowledge for persona: ${targetPersonaId}, falling back to default.`);
            // Try fallback
            try {
                const defaultPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data", "knowledge", "impact_startups.md");
                knowledgeContext = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(defaultPath, "utf-8");
            } catch (fallbackErr) {
                knowledgeContext = "Knowledge base unavailable.";
            }
        }
        const n8nUrl = process.env.N8N_WEBHOOK_URL || "https://lighteagle.app.n8n.cloud/webhook-test/weya-voice-chat";
        console.log("Calling n8n Webhook:", n8nUrl);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const payload = {
            personaId: targetPersonaId,
            sessionId,
            userMessage: messageToSend,
            knowledgeContext
        };
        const n8nResponse = await fetch(n8nUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!n8nResponse.ok) {
            throw new Error(`n8n webhook failed with status: ${n8nResponse.status}`);
        }
        const data = await n8nResponse.json();
        // Ensure we return a consistent shape
        return Response.json({
            assistantText: data.assistantText || data.output || data.text || JSON.stringify(data)
        });
    } catch (error) {
        console.error("Error in chat route:", error);
        return Response.json({
            error: error.message || "Internal Server Error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1b750a66._.js.map