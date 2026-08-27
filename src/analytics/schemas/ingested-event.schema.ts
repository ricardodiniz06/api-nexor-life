import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IngestedEventDocument = HydratedDocument<IngestedEvent>;

@Schema({ timestamps: true, collection: 'ingested_events' })
export class IngestedEvent {
  @Prop({ required: true, index: true })
  systemKey!: string; // 'TASY' | 'ESUS' | 'TOTVS' | 'CFM' | 'ANS'

  @Prop({ required: true })
  patientRecordNumber!: string;

  @Prop({ required: true })
  patientName!: string;

  @Prop({ required: true })
  eventType!: string; // 'CONSULTATION' | 'EXAM' | 'PROCEDURE' | 'MEDICATION' | 'ADMISSION' | 'DISCHARGE'

  @Prop({ required: true })
  sector!: string;

  @Prop()
  attendingPhysician?: string;

  @Prop()
  insuranceName?: string;

  @Prop({ type: Object })
  rawPayload!: Record<string, any>;

  @Prop({ default: 0 })
  costEstimated?: number;

  @Prop({ default: 30 })
  attendanceDurationMinutes?: number;

  @Prop({ default: Date.now, index: true })
  eventDate!: Date;
}

export const IngestedEventSchema = SchemaFactory.createForClass(IngestedEvent);

// Índices compostos para agregações ultra-rápidas
IngestedEventSchema.index({ systemKey: 1, eventDate: -1 });
IngestedEventSchema.index({ sector: 1, eventDate: -1 });
