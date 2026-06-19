// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    enum Status { None, Funded, Submitted, Approved, Rejected, Escalated, Refunded }

    struct Job {
        uint256 id;
        address payable client;
        address payable freelancer;
        uint256 amount;
        string metadataUri; // job requirements
        string submissionUri; // freelancer submission
        Status status;
    }

    uint256 public jobCount;
    address public owner;
    address public reviewer; // authorized human reviewer

    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 amount, string metadataUri);
    event WorkSubmitted(uint256 indexed jobId, address indexed freelancer, string submissionUri);
    event PaymentReleased(uint256 indexed jobId, address indexed to, uint256 amount);
    event RefundIssued(uint256 indexed jobId, address indexed to, uint256 amount);
    event Escalated(uint256 indexed jobId);
    event DisputeResolved(uint256 indexed jobId, bool approved);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyReviewer() {
        require(msg.sender == reviewer, "Not authorized reviewer");
        _;
    }

    constructor(address _reviewer) {
        owner = msg.sender;
        reviewer = _reviewer;
        jobCount = 0;
    }

    // Create a job and fund escrow in one transaction
    function createJob(address payable _freelancer, string calldata _metadataUri) external payable returns (uint256) {
        require(msg.value > 0, "Must fund escrow");
        require(_freelancer != address(0), "Freelancer required");

        jobCount += 1;
        uint256 id = jobCount;

        jobs[id] = Job({
            id: id,
            client: payable(msg.sender),
            freelancer: _freelancer,
            amount: msg.value,
            metadataUri: _metadataUri,
            submissionUri: "",
            status: Status.Funded
        });

        emit JobCreated(id, msg.sender, _freelancer, msg.value, _metadataUri);
        return id;
    }

    // Freelancer submits work for a job they are assigned to
    function submitWork(uint256 _jobId, string calldata _submissionUri) external {
        Job storage j = jobs[_jobId];
        require(j.id == _jobId, "Job does not exist");
        require(msg.sender == j.freelancer, "Only assigned freelancer can submit");
        require(j.status == Status.Funded || j.status == Status.Rejected, "Job not in submittable state");

        j.submissionUri = _submissionUri;
        j.status = Status.Submitted;

        emit WorkSubmitted(_jobId, msg.sender, _submissionUri);
    }

    // Release payment to freelancer (called by backend owner after AI/human approval)
    function releasePayment(uint256 _jobId) external onlyOwner {
        Job storage j = jobs[_jobId];
        require(j.id == _jobId, "Job does not exist");
        require(j.status == Status.Submitted || j.status == Status.Escalated, "Job not in releasable state");

        uint256 amount = j.amount;
        address payable to = j.freelancer;

        j.amount = 0;
        j.status = Status.Approved;

        (bool success,) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit PaymentReleased(_jobId, to, amount);
    }

    // Refund client (called by owner only)
    function refundClient(uint256 _jobId) external onlyOwner {
        Job storage j = jobs[_jobId];
        require(j.id == _jobId, "Job does not exist");
        require(j.status == Status.Submitted || j.status == Status.Escalated || j.status == Status.Funded, "Job not refundable");

        uint256 amount = j.amount;
        address payable to = j.client;

        j.amount = 0;
        j.status = Status.Refunded;

        (bool success,) = to.call{value: amount}("");
        require(success, "Refund failed");

        emit RefundIssued(_jobId, to, amount);
    }

    // Escalate dispute (either party can call to flag human review)
    function escalateDispute(uint256 _jobId) external {
        Job storage j = jobs[_jobId];
        require(j.id == _jobId, "Job does not exist");
        require(msg.sender == j.client || msg.sender == j.freelancer, "Only involved parties can escalate");
        require(j.status == Status.Submitted || j.status == Status.Rejected || j.status == Status.Funded, "Cannot escalate now");

        j.status = Status.Escalated;
        emit Escalated(_jobId);
    }

    // Reviewer resolves escalated disputes
    function resolveDispute(uint256 _jobId, bool _approve) external onlyReviewer {
        Job storage j = jobs[_jobId];
        require(j.id == _jobId, "Job does not exist");
        require(j.status == Status.Escalated, "Job not escalated");

        if (_approve) {
            // release to freelancer
            uint256 amount = j.amount;
            address payable to = j.freelancer;
            j.amount = 0;
            j.status = Status.Approved;
            (bool success,) = to.call{value: amount}("");
            require(success, "Transfer failed");
            emit DisputeResolved(_jobId, true);
            emit PaymentReleased(_jobId, to, amount);
        } else {
            // refund client
            uint256 amount = j.amount;
            address payable to = j.client;
            j.amount = 0;
            j.status = Status.Refunded;
            (bool success,) = to.call{value: amount}("");
            require(success, "Refund failed");
            emit DisputeResolved(_jobId, false);
            emit RefundIssued(_jobId, to, amount);
        }
    }

    // Allow owner to change reviewer
    function setReviewer(address _reviewer) external onlyOwner {
        reviewer = _reviewer;
    }

    // Helper to get job summary
    function getJob(uint256 _jobId) external view returns (uint256, address, address, uint256, string memory, string memory, Status) {
        Job storage j = jobs[_jobId];
        return (j.id, j.client, j.freelancer, j.amount, j.metadataUri, j.submissionUri, j.status);
    }
}
