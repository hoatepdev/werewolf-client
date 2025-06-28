"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { Role } from "@/types/role";
import { LIST_ROLE } from "@/app/constants/role";

interface RoleSelectionProps {
  onChange?: (roles: Role[]) => void;
  totalCount: number;
}

export function RoleSelection({ onChange, totalCount }: RoleSelectionProps) {
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  const handleRoleIncrement = (roleId: string) => {
    const currentCount = roleCounts[roleId] || 0;
    const totalSelected = Object.values(roleCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalSelected < totalCount) {
      const newCounts = { ...roleCounts, [roleId]: currentCount + 1 };
      setRoleCounts(newCounts);

      const selectedRolesArray: Role[] = [];
      Object.entries(newCounts).forEach(([roleId, count]) => {
        const role = LIST_ROLE.find((r) => r.id === roleId);
        if (role) {
          for (let i = 0; i < count; i++) {
            selectedRolesArray.push(role);
          }
        }
      });
      onChange?.(selectedRolesArray);
    }
  };

  const handleRoleDecrement = (roleId: string) => {
    const currentCount = roleCounts[roleId] || 0;
    if (currentCount > 0) {
      const newCounts = { ...roleCounts, [roleId]: currentCount - 1 };
      if (newCounts[roleId] === 0) {
        delete newCounts[roleId];
      }
      setRoleCounts(newCounts);

      const selectedRolesArray: Role[] = [];
      Object.entries(newCounts).forEach(([roleId, count]) => {
        const role = LIST_ROLE.find((r) => r.id === roleId);
        if (role) {
          for (let i = 0; i < count; i++) {
            selectedRolesArray.push(role);
          }
        }
      });
      onChange?.(selectedRolesArray);
    }
  };

  const selectedCount = Object.values(roleCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="w-full mb-16">
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 tracking-wide">
          SELECT ROLES
        </h3>
        <p className="text-zinc-400 text-sm">
          {selectedCount}/{totalCount} roles selected
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {LIST_ROLE.map((role) => {
          const count = roleCounts[role.id] || 0;
          const isMaxReached = selectedCount >= totalCount;

          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:border-zinc-600 ${
                count > 0
                  ? "border-yellow-400 bg-zinc-700/50"
                  : isMaxReached
                  ? "pointer-events-none opacity-50"
                  : "border-zinc-700 bg-zinc-800"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.emoji}</span>
                    <div>
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {role.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleDecrement(role.id);
                      }}
                      disabled={count === 0}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        count === 0
                          ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">
                      {count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleIncrement(role.id);
                      }}
                      disabled={isMaxReached}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isMaxReached
                          ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
