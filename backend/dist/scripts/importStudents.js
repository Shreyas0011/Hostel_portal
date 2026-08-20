"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const User_1 = require("../models/User");
// Load environmental variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const CSV_PATH = path_1.default.resolve(__dirname, '../../updated hostel details.csv');
// Double-quote aware CSV parser
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        }
        else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}
// Helpers mirroring the frontend student generation logic
function getDivisionBlock(gender, division) {
    if (gender.trim().toLowerCase() === 'female') {
        return division.includes('I PU') ? 'A' : 'B';
    }
    else {
        return division.includes('I PU') ? 'C' : 'D';
    }
}
function getSharing(index) {
    return (index % 2) === 0 ? 2 : 3;
}
function calculateAllocation(index, gender, division) {
    const block = getDivisionBlock(gender, division);
    const sharing = getSharing(index);
    const floor = ((index - 1) % 4) + 1;
    const roomSuffix = sharing === 3 ? ['01', '02'][(index - 1) % 2] : ['03', '04'][(index - 1) % 2];
    const room = `${block}-${floor}${roomSuffix}`;
    const bedLabels = sharing === 3 ? ['Bed A', 'Bed B', 'Bed C'] : ['Bed A', 'Bed B'];
    const bed = bedLabels[(index - 1) % bedLabels.length];
    return { block, sharing, room, bed };
}
function calculateAcademic(division) {
    let year = 1;
    if (division.includes('II '))
        year = 2;
    else if (division.includes('III '))
        year = 3;
    let course = 'Pre-University';
    let dept = division.includes('SCI') ? 'Science' : 'Commerce';
    if (division.includes('B.Com')) {
        course = 'B.Com';
        dept = 'Commerce';
    }
    else if (division.includes('BBA')) {
        course = 'BBA';
        dept = 'Management';
    }
    return { year, course, dept };
}
const generateStudentEmail = (name, index) => {
    const clean = name.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
    const parts = clean.split(' ');
    const emailDomain = index <= 2 ? 'transcendgroup.org' : 'hostel.edu';
    return `${parts.join('.')}@${emailDomain}`;
};
const generateParentPassword = (index, usn) => {
    const indexStr = String(index).padStart(4, '0');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    return `Parent@${indexStr}${randomSuffix}`;
};
const importStudents = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/facility_portal';
        console.log(`Connecting to MongoDB at: ${mongoUri}`);
        await mongoose_1.default.connect(mongoUri, { dbName: 'facility_portal' });
        console.log('✅ Connected to MongoDB.');
        if (!fs_1.default.existsSync(CSV_PATH)) {
            console.error(`Error: CSV file not found at ${CSV_PATH}`);
            process.exit(1);
        }
        const content = fs_1.default.readFileSync(CSV_PATH, 'utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
            console.error('Error: CSV file is empty or missing data lines.');
            process.exit(1);
        }
        const headers = parseCSVLine(lines[0]);
        console.log('Detected CSV Headers:', headers.slice(0, 14));
        const bulkOps = [];
        const parentCredentialsList = [];
        let skippedCount = 0;
        let validCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length < 14) {
                console.warn(`Line ${i + 1}: Skipped due to insufficient columns (${row.length} found, expected at least 14).`);
                skippedCount++;
                continue;
            }
            const snStr = row[0];
            const enrollmentNo = row[1];
            const studentName = row[2];
            const division = row[3];
            const newOrExisting = row[4];
            const sec = row[5];
            const sMobileNo = row[6];
            const parentName = row[7]; // Parent Name
            const pRegMob = row[8]; // P-Reg-MOB (parent mobile)
            const relation = row[9]; // Relation
            const gender = row[10]; // Gender
            const dob = row[11]; // DOB
            const studentEmail = row[12]; // Student Email ID
            const pRegEmail = row[13]; // P-Reg-Email ID (parent email)
            const address = row[14];
            const allergies = row[15] || '';
            const sn = parseInt(snStr, 10);
            // Validate required fields
            if (!enrollmentNo || enrollmentNo.trim().length === 0) {
                console.warn(`Line ${i + 1}: Skipped due to missing Enrollment Number.`);
                skippedCount++;
                continue;
            }
            if (!studentName || studentName.trim().length === 0) {
                console.warn(`Line ${i + 1}: Skipped due to missing Student Name for USN ${enrollmentNo}.`);
                skippedCount++;
                continue;
            }
            if (!pRegEmail || pRegEmail.trim().length === 0 || !pRegEmail.includes('@')) {
                console.warn(`Line ${i + 1}: Skipped due to invalid/missing Parent/Register Email ID (${pRegEmail}) for USN ${enrollmentNo}.`);
                skippedCount++;
                continue;
            }
            validCount++;
            const cleanedName = studentName.trim();
            const parentEmailCleaned = pRegEmail.trim();
            const cleanedUsn = enrollmentNo.trim().toUpperCase();
            // Determine allocations based on serial number index or fallback to loop index
            const allocationIndex = isNaN(sn) ? validCount : sn;
            const { block, sharing, room, bed } = calculateAllocation(allocationIndex, gender, division);
            const { year, course, dept } = calculateAcademic(division);
            const generatedStudentEmail = generateStudentEmail(cleanedName, allocationIndex);
            // Determine Student Password
            const defaultStudentPassword = 'Student@123';
            const hashedStudentPassword = await bcryptjs_1.default.hash(defaultStudentPassword, 10);
            // Generate Parent Password
            const existingParent = parentCredentialsList.find(pc => pc.parentEmail.toLowerCase() === parentEmailCleaned.toLowerCase());
            let generatedParentPassword = '';
            if (existingParent) {
                generatedParentPassword = existingParent.parentPassword;
            }
            else {
                generatedParentPassword = generateParentPassword(allocationIndex, cleanedUsn);
                parentCredentialsList.push({
                    sn: allocationIndex,
                    studentName: cleanedName,
                    studentUsn: cleanedUsn,
                    parentEmail: parentEmailCleaned,
                    parentPassword: generatedParentPassword
                });
            }
            const hashedParentPassword = await bcryptjs_1.default.hash(generatedParentPassword, 10);
            const studentDoc = {
                name: cleanedName,
                email: generatedStudentEmail,
                role: 'student',
                isActive: true,
                firstLogin: true,
                // Student specific attributes
                usn: cleanedUsn,
                division: division.trim(),
                room,
                block,
                bed,
                sharing,
                course,
                dept,
                year,
                phone: sMobileNo ? sMobileNo.trim() : '',
                parentPhone: pRegMob ? pRegMob.trim() : '',
                parentEmail: parentEmailCleaned,
                parentName: parentName ? parentName.trim() : `Parent of ${cleanedName}`,
                parentRelation: relation.trim() || 'Parent',
                gender: gender.trim(),
                dob: dob.trim(),
                address: address ? address.trim() : '',
                allergies: allergies ? allergies.trim() : '',
                isNewStudent: newOrExisting.trim().toLowerCase() === 'new',
            };
            const parentDoc = {
                name: parentName ? parentName.trim() : `Parent of ${cleanedName}`,
                email: parentEmailCleaned,
                role: 'parent',
                isActive: true,
                firstLogin: true,
                studentId: cleanedUsn, // Associate parent with student USN
                phone: pRegMob ? pRegMob.trim() : '',
                parentRelation: relation.trim() || 'Parent',
                address: address ? address.trim() : '',
            };
            // Student bulk operation
            bulkOps.push({
                updateOne: {
                    filter: { usn: cleanedUsn },
                    update: {
                        $set: { ...studentDoc, password: hashedStudentPassword }
                    },
                    upsert: true
                }
            });
            // Parent bulk operation
            bulkOps.push({
                updateOne: {
                    filter: { email: parentEmailCleaned },
                    update: {
                        $set: parentDoc,
                        $setOnInsert: { password: hashedParentPassword }
                    },
                    upsert: true
                }
            });
        }
        console.log(`Processing ${bulkOps.length} upserts...`);
        if (bulkOps.length > 0) {
            const result = await User_1.User.bulkWrite(bulkOps);
            console.log('✅ Bulk write operation completed successfully.');
            console.log(`- Matched count: ${result.matchedCount}`);
            console.log(`- Modified count: ${result.modifiedCount}`);
            console.log(`- Upserted count: ${result.upsertedCount}`);
        }
        // Write parent credentials to CSV file
        if (parentCredentialsList.length > 0) {
            const csvHeaders = 'SN,Student Name,Student USN,Parent Email,Generated Parent Password\n';
            const csvRows = parentCredentialsList.map(pc => {
                const escapedName = pc.studentName.includes(',') ? `"${pc.studentName}"` : pc.studentName;
                return `${pc.sn},${escapedName},${pc.studentUsn},${pc.parentEmail},${pc.parentPassword}`;
            }).join('\n');
            const csvPath = path_1.default.resolve(__dirname, '../../Parent Credentials.csv');
            fs_1.default.writeFileSync(csvPath, csvHeaders + csvRows, 'utf-8');
            console.log(`🔑 Parent login credentials written successfully to: ${csvPath}`);
        }
        console.log(`Summary: Imported ${validCount} students successfully, Skipped ${skippedCount} rows.`);
        await mongoose_1.default.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Critical error during student import:', error.message);
        process.exit(1);
    }
};
importStudents();
