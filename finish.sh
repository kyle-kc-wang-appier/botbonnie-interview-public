#!/bin/bash

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$PROJECT_ROOT" ]; then
  echo "failed"
  exit 1
fi

find "$PROJECT_ROOT" -mindepth 1 -exec rm -rf {} +

cat <<EOF > "$PROJECT_ROOT/THANK_YOU.md"
# 🙏 Thank You for Joining Us!

We sincerely appreciate the time and effort you spent participating in our technical interview process. It was a true pleasure to have you explore and engage with our codebase.

Your willingness to take on challenges and showcase your skills means a great deal to us. We hope this experience gave you a meaningful glimpse into the way we think, build, and collaborate.

Regardless of the outcome, we truly value your interest in our team and the passion you bring to your work. Please know that your efforts did not go unnoticed.

Thank you once again, and we wish you all the best on your journey ahead. May it be filled with growth, inspiration, and continued success.

Warm regards,  
**The Engineering Team**
EOF

echo "Finish"
