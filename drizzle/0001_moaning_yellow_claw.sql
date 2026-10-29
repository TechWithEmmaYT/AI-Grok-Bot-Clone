CREATE TABLE "dot" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"shape" text DEFAULT 'blob' NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"template_key" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dot_tool" (
	"dot_id" text NOT NULL,
	"tool_key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "dot_tool_dot_id_tool_key_pk" PRIMARY KEY("dot_id","tool_key")
);
--> statement-breakpoint
CREATE TABLE "template" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"default_instructions" text NOT NULL,
	"default_shape" text NOT NULL,
	"default_color" text NOT NULL,
	"default_tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" text DEFAULT '0' NOT NULL,
	CONSTRAINT "template_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "dot" ADD CONSTRAINT "dot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dot_tool" ADD CONSTRAINT "dot_tool_dot_id_dot_id_fk" FOREIGN KEY ("dot_id") REFERENCES "public"."dot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dot_user_id_idx" ON "dot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dot_user_status_idx" ON "dot" USING btree ("user_id","status");