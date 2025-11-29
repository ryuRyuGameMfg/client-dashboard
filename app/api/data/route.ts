import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'projects.json');

// データディレクトリが存在しない場合は作成
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// GET: データを読み込む
export async function GET() {
  try {
    ensureDataDir();
    
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // ファイルが存在しない場合は空のデータを返す
      return NextResponse.json({ projects: [], lastUpdated: new Date().toISOString() });
    }
    
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to read data file:', error);
    return NextResponse.json({ projects: [], lastUpdated: new Date().toISOString() });
  }
}

// POST: データを保存する
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    
    const data = await request.json();
    data.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write data file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
  }
}

