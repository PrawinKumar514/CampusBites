"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from '@/components/ui/card';

export default function PickupScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const timeSlots = [
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
    '12:30 PM - 1:00 PM',
    '1:00 PM - 1:30 PM',
    '5:00 PM - 5:30 PM',
    '5:30 PM - 6:00 PM',
    '6:00 PM - 6:30 PM',
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border p-0"
        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
      />
      <div className="space-y-4">
        <p className="font-medium">Available Time Slots</p>
        <Select defaultValue={timeSlots[2]}>
          <SelectTrigger>
            <SelectValue placeholder="Select a time slot" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map(slot => (
              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
