import bcrypt from "bcrypt";
import { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "../src/config/env";
import { closeDbPool, getDbPool } from "../src/config/db";

interface IdRow extends RowDataPacket {
  id: number;
}

interface SectionRow extends RowDataPacket {
  id: number;
  order_index: number;
}

async function findIdByEmail(email: string): Promise<number> {
  const db = getDbPool();
  const [rows] = await db.query<IdRow[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

  if (!rows[0]) {
    throw new Error(`User not found for email ${email}`);
  }

  return Number(rows[0].id);
}

async function seed() {
  const db = getDbPool();
  const passwordHash = await bcrypt.hash("demo-password", env.auth.bcryptSaltRounds);

  const [userResult] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        name = VALUES(name)
    `,
    ["demo@casamia.app", passwordHash, "Demo Learner"]
  );

  const userId = userResult.insertId > 0 ? Number(userResult.insertId) : await findIdByEmail("demo@casamia.app");

  await db.execute(
    `
      INSERT INTO subjects (title, slug, description, is_published)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        is_published = VALUES(is_published)
    `,
    [
      "Foundations of Story Learning",
      "foundations-of-story-learning",
      "A starter subject that demonstrates sections, video ordering, and progress tracking.",
      true
    ]
  );

  const [subjectRows] = await db.query<IdRow[]>("SELECT id FROM subjects WHERE slug = ? LIMIT 1", [
    "foundations-of-story-learning"
  ]);
  const subjectId = Number(subjectRows[0].id);

  await db.execute(
    `
      INSERT INTO enrollments (user_id, subject_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id)
    `,
    [userId, subjectId]
  );

  const sections = [
    { title: "Begin Here", orderIndex: 1 },
    { title: "Build Momentum", orderIndex: 2 }
  ];

  for (const section of sections) {
    await db.execute(
      `
        INSERT INTO sections (subject_id, title, order_index)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE title = VALUES(title)
      `,
      [subjectId, section.title, section.orderIndex]
    );
  }

  const [sectionRows] = await db.query<SectionRow[]>(
    "SELECT id, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC",
    [subjectId]
  );
  const sectionIds = new Map(sectionRows.map((row) => [row.order_index, row.id]));

  const videos = [
    {
      sectionOrder: 1,
      title: "Welcome to the Journey",
      description: "A short introduction to the structure of this LMS scaffold.",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      orderIndex: 1,
      durationSeconds: 210
    },
    {
      sectionOrder: 1,
      title: "How Lessons Unlock",
      description: "Explains the previous and next lesson flow used by the platform.",
      youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      orderIndex: 2,
      durationSeconds: 260
    },
    {
      sectionOrder: 2,
      title: "Progress and Resume",
      description: "Shows how video progress is stored and resumed for a learner.",
      youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      orderIndex: 1,
      durationSeconds: 180
    },
    {
      sectionOrder: 2,
      title: "Completing the Module",
      description: "Closes the sample subject with the final lesson in the sequence.",
      youtubeUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      orderIndex: 2,
      durationSeconds: 240
    }
  ];

  for (const video of videos) {
    const sectionId = sectionIds.get(video.sectionOrder);
    if (!sectionId) {
      throw new Error(`Missing section for order ${video.sectionOrder}`);
    }

    await db.execute(
      `
        INSERT INTO videos (
          section_id,
          title,
          description,
          youtube_url,
          order_index,
          duration_seconds
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          youtube_url = VALUES(youtube_url),
          duration_seconds = VALUES(duration_seconds)
      `,
      [
        sectionId,
        video.title,
        video.description,
        video.youtubeUrl,
        video.orderIndex,
        video.durationSeconds
      ]
    );
  }

  console.log("Seed completed");
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDbPool();
  });
