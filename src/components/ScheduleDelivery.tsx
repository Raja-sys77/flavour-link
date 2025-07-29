import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleDeliveryProps {
  onSchedule: (deliveryInfo: {
    deliveryDate: string;
    timeSlot: string;
    instructions: string;
  }) => void;
}

const ScheduleDelivery = ({ onSchedule }: ScheduleDeliveryProps) => {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [instructions, setInstructions] = useState('');

  const timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM', 
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM'
  ];

  const handleSchedule = () => {
    if (deliveryDate && timeSlot) {
      onSchedule({
        deliveryDate,
        timeSlot,
        instructions
      });
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Delivery
        </CardTitle>
        <CardDescription>
          Choose your preferred delivery date and time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delivery-date">Delivery Date</Label>
          <Input
            id="delivery-date"
            type="date"
            min={minDate}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred Time Slot</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Delivery Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Special delivery instructions, address details, etc."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSchedule} 
          disabled={!deliveryDate || !timeSlot}
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Schedule Delivery
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScheduleDelivery;