### Sources for this module's facts

- **KQL's pipe syntax and the `where` / `summarize ... by` / `bin()` / `order by` operators used in this module's queries:** [Microsoft Learn: KQL quick reference](https://learn.microsoft.com/en-us/kusto/query/kql-quick-reference), [Microsoft Learn: Aggregate Microsoft Sentinel data with summary rules](https://learn.microsoft.com/en-us/azure/sentinel/summary-rules)
- **The `let` statement used to name the threshold constant, including that it must end in a semicolon:** [Microsoft Learn: Let statement](https://learn.microsoft.com/en-us/kusto/query/let-statement)
- **The `SecurityEvent` table, and that Windows writes a failed logon as event ID 4625, a different code from the 4624 a successful one gets:** [Microsoft Learn: SecurityEvent table reference](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/securityevent)
- **Password Spraying, the technique this module's detection is built against:** [MITRE ATT&CK: T1110.003, Password Spraying](https://attack.mitre.org/techniques/T1110/003/)
