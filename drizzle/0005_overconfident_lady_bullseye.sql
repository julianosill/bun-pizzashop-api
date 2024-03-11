ALTER TABLE "auth_links" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "auth_links" ALTER COLUMN "created_at" SET NOT NULL;