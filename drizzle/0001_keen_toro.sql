CREATE TABLE `farms` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`ownerId` int NOT NULL,
	`totalArea` decimal(10,2),
	`cropType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fieldUploads` (
	`id` varchar(36) NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`fieldId` varchar(36) NOT NULL,
	`workerId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`imageType` enum('soil','crop','pest','irrigation','general') DEFAULT 'general',
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`notes` text,
	`storageKey` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fieldUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fields` (
	`id` varchar(36) NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`area` decimal(10,2),
	`cropType` varchar(100),
	`plantedDate` timestamp,
	`expectedHarvestDate` timestamp,
	`growthStage` varchar(50),
	`waterStressIndex` decimal(5,2),
	`pestRiskLevel` enum('low','medium','high') DEFAULT 'low',
	`soilMoisture` decimal(5,2),
	`temperature` decimal(5,2),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`type` enum('recommendation','task_completed','alert','info') DEFAULT 'info',
	`read` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` varchar(36) NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`fieldId` varchar(36) NOT NULL,
	`action` enum('irrigate','block_fertiliser','scout_field','prepare_harvest','apply_pesticide','reduce_irrigation','increase_nitrogen','monitor_pest') NOT NULL,
	`urgency` enum('low','medium','high') DEFAULT 'medium',
	`rationale` text,
	`status` enum('pending','acknowledged','completed') DEFAULT 'pending',
	`acknowledgedAt` timestamp,
	`completedAt` timestamp,
	`source` varchar(100),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weatherData` (
	`id` varchar(36) NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`fieldId` varchar(36),
	`temperature` decimal(5,2),
	`humidity` decimal(5,2),
	`rainfall` decimal(5,2),
	`windSpeed` decimal(5,2),
	`condition` varchar(50),
	`forecastDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weatherData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workerAssignments` (
	`id` varchar(36) NOT NULL,
	`workerId` int NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`fieldId` varchar(36),
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`unassignedAt` timestamp,
	CONSTRAINT `workerAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workerTasks` (
	`id` varchar(36) NOT NULL,
	`farmId` varchar(36) NOT NULL,
	`fieldId` varchar(36) NOT NULL,
	`workerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`taskType` enum('irrigate','fertilize','scout','harvest','weeding','pesticide','other') NOT NULL,
	`status` enum('pending','in_progress','completed','overdue') DEFAULT 'pending',
	`urgency` enum('low','medium','high') DEFAULT 'medium',
	`dueAt` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`proofImageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workerTasks_id` PRIMARY KEY(`id`)
);
