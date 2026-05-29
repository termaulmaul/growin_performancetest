FROM alpine:latest
RUN apk add --no-cache openssh bash shadow
RUN ssh-keygen -A
RUN useradd -m -s /bin/bash qa
RUN echo "qa:M@nsek.1234" | chpasswd
# Configure SSH server
RUN sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PermitEmptyPasswords.*/PermitEmptyPasswords no/' /etc/ssh/sshd_config
# Create a dummy repo directory on the remote VM
RUN mkdir -p /home/qa/growin_performancetest/Script/Growin_Banner_Promo
RUN echo "export function BP001() {}" > /home/qa/growin_performancetest/Script/Growin_Banner_Promo/Growin_Banner_Promo.js
RUN echo -e "#!/bin/bash\necho '=== REMOTE RUNNER SH EXECUTION ==='\necho 'Current Directory: '\$(pwd)\necho 'Regression test completed successfully!'" > /home/qa/growin_performancetest/Script/Growin_Banner_Promo/Growin_Banner_Promo_Regression.sh
RUN chmod +x /home/qa/growin_performancetest/Script/Growin_Banner_Promo/Growin_Banner_Promo_Regression.sh
# Dummy k6 binary at the remote root
RUN echo -e "#!/bin/bash\necho '=== REMOTE K6 RUNNER ==='\necho 'k6 command args: \$@'" > /home/qa/growin_performancetest/k6
RUN chmod +x /home/qa/growin_performancetest/k6
RUN chown -R qa:qa /home/qa/growin_performancetest
EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
