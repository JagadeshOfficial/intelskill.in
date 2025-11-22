# Gmail SMTP Configuration for OTP Sending

## Issue
The OTP sending is failing because Gmail requires an **App Password** for SMTP authentication, not your regular account password.

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already enabled)
1. Go to https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Under "Select the app and device you want to generate the app password for":
   - **App**: Select **Mail**
   - **Device**: Select **Windows Computer** (or your device type)
3. Click **Generate**
4. Google will show a 16-character password (looks like: `xxxx xxxx xxxx xxxx`)
5. **Copy this password** - this is your **App Password**

### Step 3: Update application.yml
Update your `src/main/resources/application.yml` file:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: jagadeswararaovana@gmail.com
    password: <YOUR_APP_PASSWORD>  # Paste the 16-character app password here (remove spaces)
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

**Example with real app password:**
```yaml
spring:
  mail:
    username: jagadeswararaovana@gmail.com
    password: abcdefghijklmnop  # 16-character app password
```

### Step 4: Rebuild and Restart

```powershell
cd 'C:\Users\jagad\OneDrive\Desktop\Jagadesh\Workspace\lms-project\backend\auth-service'
mvn clean package -DskipTests -q
java -jar target/auth-service-1.0.0.jar
```

### Step 5: Test OTP Sending

```powershell
$json = '{"email":"jagadeswararaovana@gmail.com"}'
curl.exe -s -X POST http://localhost:8081/api/v1/tutor/send-otp `
  -H "Content-Type: application/json" `
  -d $json
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "OTP sent to jagadeswararaovana@gmail.com"
}
```

## Alternative: Use Environment Variables (Recommended for Production)

Instead of hardcoding credentials in `application.yml`, use environment variables:

### Update application.yml:
```yaml
spring:
  mail:
    username: ${MAIL_USERNAME:jagadeswararaovana@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
```

### Set Environment Variables in PowerShell:
```powershell
$env:MAIL_USERNAME = "jagadeswararaovana@gmail.com"
$env:MAIL_PASSWORD = "your-16-char-app-password"
java -jar target/auth-service-1.0.0.jar
```

## Troubleshooting

### "Failed to send OTP email: 535 5.7.8"
- **Cause**: Invalid app password or incorrect username
- **Fix**: Regenerate app password and verify it matches exactly

### "Failed to send OTP email: Connection refused"
- **Cause**: Gmail SMTP server not reachable
- **Fix**: Check internet connection, verify firewall isn't blocking port 587

### "Failed to send OTP email: TLS handshake failed"
- **Cause**: TLS configuration issue
- **Fix**: Already enabled in `MailConfig.java` - should work with app password

## Frontend Integration

Once the backend is working, your frontend button at `http://localhost:3000` will:
1. Call `POST http://localhost:8081/api/v1/tutor/send-otp`
2. Get response: `{"success": true, "message": "OTP sent to your-email@example.com"}`
3. Display a success message to the user
4. User checks their email for the OTP

---

**Do you need help setting up the app password? Let me know!**
