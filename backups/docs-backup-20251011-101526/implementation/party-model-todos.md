# Party Model Implementation - Remaining TODOs

## ✅ Phase 1-3: COMPLETE
- ✅ Party tables created (parties, party_roles, party_contacts, party_relationships)
- ✅ Party references added to existing tables (partyId columns)
- ✅ Data backfill complete (19 parties, 30 roles, 28 contacts)
- ✅ All entities migrated (100% coverage)

## 🚧 Phase 4: Update Application Logic (IN PROGRESS)

### Backend APIs to Update
- [ ] `/api/customers` → migrate to PartyService queries
- [ ] `/api/customers/[id]` → use party-based lookups
- [ ] `/api/orders` → use `customerPartyId` instead of `customerId`
- [ ] `/api/orders/[id]` → update customer references
- [ ] `/api/analytics/dashboard` → aggregate via party_roles
- [ ] Create `/api/party` endpoints (already created, needs testing)
- [ ] Create `/api/party/[id]` endpoints (already created, needs testing)

### Middleware Updates
- [ ] Update `ensureFarmAccess` to check party_roles
- [ ] Update tenant middleware for party-based permissions
- [ ] Add party-based audit logging

### Service Layer
- [ ] Test PartyService thoroughly
- [ ] Add caching layer for frequent party lookups
- [ ] Add party search/filter capabilities
- [ ] Add party merge capability (de-duplication)

## 🔜 Phase 5: Frontend Refactor

### Customer Management
- [ ] Update `/sales/b2b-customers` to use `/api/party?role=CUSTOMER_B2B`
- [ ] Update `/sales/b2c-customers` to use `/api/party?role=CUSTOMER_B2C`
- [ ] Consolidate B2B/B2C into single `/sales/customers` page
- [ ] Update CustomerModal to work with party structure
- [ ] Add contact management UI (add/edit/delete emails, phones, addresses)

### Orders
- [ ] Update order creation to use party selector
- [ ] Display party contacts in order details
- [ ] Update order analytics to aggregate by party

### Analytics
- [ ] Update customer analytics to query party_roles
- [ ] Add party-based segmentation
- [ ] Update revenue reports to use customerPartyId

### Sales Dashboard
- [ ] Update customer counts via party_roles
- [ ] Update customer metrics
- [ ] Add party relationship visualizations

## 🧹 Phase 6: Cleanup & Optimization

### Schema Cleanup
- [ ] Add NOT NULL constraints to partyId columns
- [ ] Add foreign key constraints (farms.partyId → parties.id)
- [ ] Drop deprecated columns from customers table:
  - [ ] name, email, phone, street, city, state, zipCode, country
  - [ ] businessName, businessType, contactPerson
  - [ ] Keep: id, partyId, farm_id, type, status, metadata, timestamps
- [ ] Drop customerId from orders (keep customerPartyId only)
- [ ] Consider dropping customers table entirely (use party_roles instead)

### Performance Optimization
- [ ] Add indexes for common party queries
- [ ] Create materialized views for party analytics
- [ ] Add party caching layer
- [ ] Optimize party contact lookups

### Documentation
- [ ] Update API documentation with party endpoints
- [ ] Update developer guide with party model usage
- [ ] Add party model diagrams
- [ ] Update seeding scripts to use party model

### Testing
- [ ] Update all tests to use party model
- [ ] Add party service tests
- [ ] Add party API integration tests
- [ ] Test multi-role scenarios
- [ ] Test party relationships

## Benefits Summary

### Immediate
✅ Foundation for unified customer management  
✅ Multi-role support enabled  
✅ Flexible contact management  
✅ Better data normalization  

### Future Capabilities
🚀 CRM features (party history, interactions, notes)  
🚀 Loyalty programs (party-based rewards)  
🚀 Federated identity (OAuth, SSO)  
🚀 Advanced relationship tracking  
🚀 Party merge/de-duplication  
🚀 Cross-farm party access  

## Migration Statistics

| Entity | Before | After | Coverage |
|--------|--------|-------|----------|
| Farms | 2 | 2 parties (FARM role) | 100% |
| Users | 10 | 10 parties (USER+EMPLOYEE roles) | 100% |
| Customers | 7 | 7 parties (CUSTOMER_B2B/B2C roles) | 100% |
| Suppliers | 0 | 0 parties | N/A |
| Orders | 4 | 4 with customerPartyId | 100% |

**Total Parties**: 19  
**Total Roles**: 30  
**Total Contacts**: 28  

## Risk Assessment

### Low Risk ✅
- Core tables created without breaking existing functionality
- Data backfilled successfully with validation
- Legacy columns retained for backward compatibility
- Rollback plan available

### Medium Risk ⚠️
- API refactor requires careful testing
- Frontend changes need phased rollout
- Performance impact of party joins needs monitoring

### Mitigated ✅
- Dual-write strategy (both old and new columns work)
- Gradual cutover planned
- Comprehensive logging added
- Tests updated incrementally

## Next Action Items

1. **Test Party API endpoints**: Verify `/api/party` works correctly
2. **Update one backend API**: Start with `/api/customers` (low risk)
3. **Test updated API**: Ensure backward compatibility
4. **Update one frontend page**: Start with B2B customers
5. **Validate**: Run tests and manual QA
6. **Repeat**: Continue updating APIs/pages one at a time

## Success Criteria

- [ ] All customer operations work via party model
- [ ] No data inconsistencies between old/new models
- [ ] Performance maintained or improved
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Legacy columns safely removed

---

**Current Status**: ✅ **Phases 1-3 Complete | Ready for Phase 4**  
**Confidence Level**: HIGH - Data migration successful, foundation solid  
**Recommended Next Step**: Update `/api/customers` endpoint to use PartyService

