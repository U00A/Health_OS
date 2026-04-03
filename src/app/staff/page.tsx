"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BedDouble, UserPlus, ClipboardList } from "lucide-react";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { useBetterAuthId } from "@/hooks/useBetterAuthId";

export default function StaffDashboard() {
  const betterAuthId = useBetterAuthId();
  const user = useQuery(api.users.current, betterAuthId ? { betterAuthId } : "skip");
  
  // Fetch wards for the user's hospital, then use the first ward
  const wards = useQuery(api.wards.listByHospital, 
    user?.hospital_id ? { hospital_id: user.hospital_id } : "skip"
  );
  
  const firstWardId = wards && wards.length > 0 ? wards[0]._id : undefined;
  
  const beds = useQuery(api.beds.getWardBeds, 
    firstWardId ? { ward_id: firstWardId } : "skip"
  );
  const logs = useQuery(api.caseEntries.getWardLog, 
    firstWardId && betterAuthId ? { betterAuthId, ward_id: firstWardId } : "skip"
  );


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ward Operations</h1>
          <p className="text-slate-500 font-medium mt-1">
            {wards && wards.length > 0 ? wards[0].name : "Loading ward..."}
          </p>
        </div>
        <Button variant="primary" className="font-bold shadow-lg shadow-blue-200"><UserPlus size={18} /> Admit Patient</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BED GRID */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
              <BedDouble size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Bed Status Real-Time</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {beds === undefined ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : beds?.length === 0 ? (
               <Card className="col-span-full border border-dashed border-slate-200 shadow-none bg-slate-50">
                 <div className="h-32 flex items-center justify-center text-slate-400">
                    Awaiting real-time stream via Convex Websocket...
                 </div>
               </Card>
            ) : (
              beds?.map((bed: Doc<"beds">) => {
                const isVacant = bed.status === 'vacant';
                const isOccupied = bed.status === 'occupied';
                
                return (
                   <Card 
                     key={bed._id} 
                     className={`h-28 transition-transform hover:-translate-y-1 ${
                      isVacant ? 'bg-emerald-50 border-emerald-200' :
                      isOccupied ? 'bg-rose-50 border-rose-200' :
                      'bg-amber-50 border-amber-200'
                    } border`}
                  >
                    <div className="flex flex-col justify-between p-3 h-full">
                      <span className={`font-black text-2xl tracking-tighter ${
                        isVacant ? 'text-emerald-800' : isOccupied ? 'text-rose-800' : 'text-amber-800'
                      }`}>
                        {bed.name}
                      </span>
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        color={isVacant ? "success" : isOccupied ? "danger" : "warning"}
                        className="font-black uppercase tracking-widest text-[10px]"
                      >
                        {bed.status}
                      </Chip>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT LOGS */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Case Logs</h2>
          </div>

           <Card className="border border-slate-200 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-0 overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {logs === undefined ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                  </div>
                ) : logs?.length === 0 ? (
                  <div className="p-8 flex items-center justify-center h-32 text-slate-400 font-medium">
                    Querying entries...
                  </div>
                ) : (
                  logs?.map((log: Doc<"case_entries">) => {
                     const typeColorMap: Record<string, "accent" | "success" | "danger" | "default"> = {
                       'admission': 'accent',
                       'discharge': 'success',
                       'escalation': 'danger'
                     };
                    const color = typeColorMap[log.entry_type] || 'default';

                    return (
                      <div key={log._id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <Chip size="sm" color={color} variant="soft" className="text-[10px] uppercase font-black tracking-widest font-mono">
                            {log.entry_type.replace('_', ' ')}
                          </Chip>
                          <span className="text-slate-400 text-xs font-mono font-medium">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed text-sm">
                          {log.notes || "System logged event"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
